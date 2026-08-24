const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Message = require("../models/Message");
const sendEmail = require("../utils/sendEmail");
const { sendServerError, redact } = require("../utils/secrets");

// bcrypt work factor. 10 is the bcryptjs default and meets the OWASP minimum;
// bcryptjs is pure JS, so raising it costs real request latency.
const BCRYPT_ROUNDS = 10;

// How long a verification link stays usable.
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

// The only user fields any client ever needs. Everything else on the document
// (password hash, isActive, passwordChangedAt, verification token, __v,
// timestamps) stays server-side.
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  emailVerified: !!user.emailVerified,
});

// The token carries no personal data — just the account id and role. It is
// stored in the browser, so an email in the payload would be readable by any
// script on the page (JWT payloads are base64, not encrypted).
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// Addresses are stored lowercase (schema setter), so normalize before every
// lookup too — otherwise "Admin@x.com" and "admin@x.com" would be two accounts.
const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const hashToken = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");

// Mints a verification token on `user` (caller saves) and returns the raw value
// for the emailed link. Only the hash is stored, so a database leak cannot be
// replayed to verify somebody else's address.
const issueEmailVerification = (user) => {
  const raw = crypto.randomBytes(32).toString("hex");
  user.emailVerifyTokenHash = hashToken(raw);
  user.emailVerifyExpires = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);
  return raw;
};

// Best-effort: a mail failure must never fail the request that triggered it.
// The user can always ask for a new link from the account page.
const sendVerificationEmail = async (user, rawToken) => {
  const base = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")[0]
    .trim()
    .replace(/\/$/, "");
  const link = `${base}/verify-email?token=${rawToken}`;

  const result = await sendEmail({
    to: user.email,
    subject: "Confirm your email address",
    html: `
      <h2>Confirm your email address</h2>
      <p>Click the link below to confirm this address belongs to you. The link
      expires in 24 hours.</p>
      <p><a href="${link}">Confirm my email</a></p>
      <p>If you didn't create an account, you can ignore this email.</p>
    `,
    text: `Confirm your email address: ${link}`,
  });

  // Never log the recipient — the Brevo message id is enough to trace delivery.
  if (result.success) {
    console.log(`Verification email sent (Brevo id: ${result.messageId})`);
  } else {
    console.error("Verification email NOT sent:", redact(result.error));
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = normalizeEmail(req.body.email);

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Also refuse addresses that only exist in the legacy `admins` collection.
    // Without this, a freshly seeded site (which has an Admin row but no User
    // row for the owner) would let anyone register that address and — before
    // this was fixed — be handed the admin role with a password of their own
    // choosing. The message is deliberately the same as above so registration
    // doesn't reveal which addresses belong to admins.
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password — the plaintext goes nowhere else.
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Always a plain user. Role is NEVER derived from the submitted email and
    // never read from the request body: the first admin is created by
    // `npm run seed`, and any later promotion is a deliberate database change.
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "user",
      emailVerified: false,
    });

    const rawToken = issueEmailVerification(user);
    await user.save();

    res.status(201).json({ token: signToken(user), user: publicUser(user) });

    // After the response — delivery is best-effort and must not block signup.
    sendVerificationEmail(user, rawToken).catch((err) =>
      console.error("Verification email error:", redact(err.message)),
    );
  } catch (error) {
    sendServerError(res, error, "register");
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    // Check in User model first. The hash is `select: false`, so ask for it
    // explicitly — this is the only read path that needs it.
    let user = await User.findOne({ email }).select("+password");

    // If not found in User, check in Admin model (for backward compatibility)
    if (!user) {
      const admin = await Admin.findOne({ email }).select("+password");
      if (admin) {
        // Create a user record for this admin
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create user from admin (carrying over the existing hash, never the
        // plaintext). This is the ONLY path that mints an admin at runtime, and
        // it requires the seeded password — knowing the address is not enough.
        // The address came from ADMIN_EMAIL, which the site owner controls, so
        // it needs no round-trip verification.
        user = new User({
          name: "Admin",
          email: admin.email,
          password: admin.password,
          role: "admin",
          emailVerified: true,
        });
        await user.save();

        // Delete admin record (optional - or keep for compatibility)
        // await Admin.deleteOne({ _id: admin._id });
      } else {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      // Check password for regular user
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    // Checked after the password so a wrong password and a disabled account are
    // indistinguishable to someone guessing.
    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been disabled" });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    sendServerError(res, error, "login");
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "name email role emailVerified",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(publicUser(user));
  } catch (error) {
    sendServerError(res, error, "getMe");
  }
};

// @desc    Check if user is admin
// @route   GET /api/auth/is-admin
// @access  Private
const isAdmin = async (req, res) => {
  // `auth` already read the current role from the database.
  res.json({ isAdmin: req.user?.role === "admin" });
};

// @desc    Confirm an email address from a verification link
// @route   POST /api/auth/verify-email
// @access  Public (the token is the credential)
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    // Look up by hash, and let the database enforce expiry — so an old link
    // can't be replayed.
    // Both fields are `select: false`, so ask for them explicitly — they have to
    // be loaded on the document before they can be cleared below.
    const user = await User.findOne({
      emailVerifyTokenHash: hashToken(token),
      emailVerifyExpires: { $gt: new Date() },
    }).select("+emailVerifyTokenHash +emailVerifyExpires");

    if (!user) {
      return res
        .status(400)
        .json({ message: "This link is invalid or has expired" });
    }

    user.emailVerified = true;
    user.emailVerifyTokenHash = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();

    res.json({ message: "Your email address has been confirmed" });
  } catch (error) {
    sendServerError(res, error, "verifyEmail");
  }
};

// @desc    Send a fresh verification link to the caller's own address
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "+emailVerifyTokenHash +emailVerifyExpires",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Idempotent, and it never reveals anything the caller doesn't already know
    // — they are authenticated as this account.
    if (user.emailVerified) {
      return res.json({ message: "Your email address is already confirmed" });
    }

    const rawToken = issueEmailVerification(user);
    await user.save();

    res.json({ message: "Verification email sent — check your inbox" });

    sendVerificationEmail(user, rawToken).catch((err) =>
      console.error("Verification email error:", redact(err.message)),
    );
  } catch (error) {
    sendServerError(res, error, "resendVerification");
  }
};

// @desc    Change password for the authenticated user
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // The authenticated identity is a User (admins are migrated into User on
    // login), so change the password there — not on the legacy Admin model.
    const user = await User.findById(req.userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      // 400, not 401: the *request* was properly authenticated — it's a form
      // field that's wrong. A 401 here would trip the client's interceptor and
      // log the user out for a typo.
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    // Invalidates every token issued before now (see the auth middleware), so a
    // password change actually evicts a session someone else has stolen.
    user.passwordChangedAt = new Date();
    await user.save();

    // Hand back a fresh token so the caller isn't logged out by their own
    // change. Every *other* session is now dead.
    res.json({
      message: "Password updated successfully",
      token: signToken(user),
    });
  } catch (error) {
    sendServerError(res, error, "changePassword");
  }
};

// Strips the personal data out of a departing user's contact messages while
// keeping the message body, so the admin's inbox history stays intact.
//
// Matched by account link first. The email fallback is scoped to rows with no
// account link, i.e. messages stored before Message.user existed — without it
// those older rows would keep the person's name and address forever.
const anonymizeMessagesForUser = async (user) => {
  const result = await Message.updateMany(
    { $or: [{ user: user._id }, { user: null, email: user.email }] },
    { $set: { name: "Deleted user", email: "", user: null } },
  );
  return result.modifiedCount;
};

// @desc    Delete the authenticated user's account and personal data
// @route   DELETE /api/auth/me
// @access  Private
const deleteMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Refuse to delete the last admin — the site would be left with no way to
    // reach the admin panel.
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(409).json({
          message:
            "This is the only admin account, so it can't be deleted. Promote another admin first.",
        });
      }
    }

    const messagesAnonymized = await anonymizeMessagesForUser(user);

    // Also drop any legacy Admin row for this address, otherwise the same
    // credentials would log straight back in and be re-migrated into a new User.
    await Admin.deleteOne({ email: user.email });
    await user.deleteOne();

    res.json({
      message: "Your account and personal data have been deleted",
      messagesAnonymized,
    });
  } catch (error) {
    sendServerError(res, error, "deleteMe");
  }
};

module.exports = {
  register,
  login,
  getMe,
  isAdmin,
  verifyEmail,
  resendVerification,
  changePassword,
  deleteMe,
};
