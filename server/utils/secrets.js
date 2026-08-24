// Secret and PII redaction for logs and API responses.
//
// Two things live here:
//   redact(value)                 -> masks anything that looks like a credential
//                                    or a piece of personal data
//   sendServerError(res, err, ctx) -> logs (redacted) + returns a generic 500
//
// Why this exists: driver errors are the main accidental leak path. A failed
// Mongo connection puts the whole URI — including user:password — into
// `error.message`, and Cloudinary/Brevo failures can echo request headers.
// Returning raw `error.message` to an HTTP client publishes all of that.
// Third-party error bodies also quote back the data that was sent, which for
// an email provider means the recipient's address — hence the PII patterns.

// Env keys whose *values* must never appear in a log line or response body.
// Matched against the variable name, so new secrets are covered automatically.
// Deliberately excludes non-secrets like PORT, CLIENT_URL, ADMIN_EMAIL and
// CLOUDINARY_CLOUD_NAME (the cloud name is public — it appears in image URLs).
const SENSITIVE_ENV_KEY =
  /(SECRET|PASSWORD|PASSWD|TOKEN|PRIVATE|CREDENTIAL|SESSION|COOKIE|SALT|API_?KEY|_KEY$|MONGO_URI|DATABASE_URL|DB_URL|POSTGRES|MYSQL|REDIS_URL|CONNECTION_STRING)/;

// Shape-based patterns, for secrets that never passed through process.env
// (a token from a request header, a URI assembled at runtime, a pasted key).
const PATTERNS = [
  // Credentials inside a connection string: mongodb://user:pass@host
  [
    /\b((?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis|amqps?|https?):\/\/)[^:@\s/]+:[^@\s/]+@/gi,
    "$1[REDACTED]:[REDACTED]@",
  ],
  // PEM private keys
  [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    "[REDACTED_PRIVATE_KEY]",
  ],
  [/\bxkeysib-[A-Za-z0-9-]{16,}/g, "[REDACTED_BREVO_KEY]"], // Brevo
  [/\bSG\.[A-Za-z0-9_\-.]{16,}/g, "[REDACTED_SENDGRID_KEY]"], // SendGrid
  [/\b[rsp]k_(?:live|test)_[A-Za-z0-9]{8,}/g, "[REDACTED_STRIPE_KEY]"], // Stripe
  [/\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}/g, "[REDACTED_OPENAI_KEY]"], // OpenAI
  [/\bAKIA[0-9A-Z]{12,}/g, "[REDACTED_AWS_KEY_ID]"], // AWS
  [/\bAIza[0-9A-Za-z_-]{30,}/g, "[REDACTED_GOOGLE_KEY]"], // Google/Firebase
  // JWTs / Supabase anon+service_role keys (all three are header.payload.sig)
  [
    /\beyJ[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}/g,
    "[REDACTED_JWT]",
  ],
  [/\b(bearer\s+)[A-Za-z0-9._~+/-]{8,}=*/gi, "$1[REDACTED]"],
  // Generic `key: value` / `key=value` pairs in error bodies and query strings
  [
    /\b((?:api[-_]?key|apikey|authorization|password|passwd|pwd|secret|token|access[-_]?key)["']?\s*[:=]\s*["']?)([^\s"',;}&]{6,})/gi,
    "$1[REDACTED]",
  ],
];

// Personal data patterns. Applied *after* PATTERNS, so `mongodb://u:p@host` has
// already been collapsed and its `p@host` cannot be mistaken for an address.
//
// Nothing in this app should be logging an email in the first place — this is
// the backstop for the paths we don't control, chiefly third-party error bodies
// that quote the request back at us (Brevo names the recipient it rejected).
const PII_PATTERNS = [
  [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[REDACTED_EMAIL]"],
  // Deliberately strict (leading + and 8+ digits): the app collects no phone
  // numbers, so this is defence-in-depth and must not chew up ids or counters.
  [/\+\d[\d\s().-]{7,}\d/g, "[REDACTED_PHONE]"],
];

// Object keys that hold personal data, masked by name so a short or oddly
// formatted value can't slip past the shape patterns above.
const PII_KEY = /^(E?MAIL|EMAIL_?ADDRESS|PHONE|PHONE_?NUMBER|TEL|MOBILE)$/;

// Literal secret values pulled from the environment, longest first so that a
// longer secret is masked before a shorter one that happens to be a substring.
// Built lazily: dotenv runs before this, but tests may mutate process.env.
let literalCache = null;
let literalCacheSize = -1;

const literalSecrets = () => {
  const keys = Object.keys(process.env);
  if (literalCache && literalCacheSize === keys.length) return literalCache;

  literalCache = keys
    .filter((key) => SENSITIVE_ENV_KEY.test(key))
    .map((key) => ({ key, value: process.env[key] }))
    // Short values would over-match (a 4-char password masking normal words).
    .filter(({ value }) => typeof value === "string" && value.length >= 8)
    .sort((a, b) => b.value.length - a.value.length);
  literalCacheSize = keys.length;
  return literalCache;
};

/**
 * Mask every credential-looking or personal-data substring in `value`.
 * Accepts strings, Errors, arrays and plain objects; returns the same shape.
 * @param {unknown} value
 * @returns {unknown}
 */
const redact = (value) => {
  if (value == null) return value;

  if (typeof value === "string") {
    let out = value;
    for (const { key, value: secret } of literalSecrets()) {
      out = out.split(secret).join(`[REDACTED_${key}]`);
    }
    for (const [pattern, replacement] of PATTERNS) {
      out = out.replace(pattern, replacement);
    }
    // Personal data last — see the note on PII_PATTERNS for why order matters.
    for (const [pattern, replacement] of PII_PATTERNS) {
      out = out.replace(pattern, replacement);
    }
    return out;
  }

  if (value instanceof Error) {
    return `${value.name}: ${redact(value.message)}`;
  }

  if (Array.isArray(value)) return value.map(redact);

  if (typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      // Redact by key name too, so { password: "abc" } is masked even when the
      // value is too short for the length filter above.
      const upper = key.toUpperCase();
      out[key] =
        SENSITIVE_ENV_KEY.test(upper) || PII_KEY.test(upper)
          ? "[REDACTED]"
          : redact(val);
    }
    return out;
  }

  return value;
};

/**
 * Log an unexpected error (redacted) and respond with a generic 500.
 *
 * The client never receives `error.message`: in production it gets a fixed
 * string, and in development a redacted message to keep debugging usable.
 *
 * @param {import("express").Response} res
 * @param {unknown} error   The caught error.
 * @param {string} context  Where it happened, e.g. "getProfile".
 * @param {string} [publicMessage]  Optional client-facing override.
 */
const sendServerError = (res, error, context, publicMessage) => {
  const label = context ? `[${context}]` : "[server]";
  console.error(`${label}`, redact(error instanceof Error ? error.stack : error));

  if (res.headersSent) return; // e.g. contact form already returned 201

  const message =
    publicMessage ||
    (process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again later."
      : `${context || "Server"} failed: ${redact(
          error instanceof Error ? error.message : String(error),
        )}`);

  res.status(500).json({ message });
};

module.exports = { redact, sendServerError };
