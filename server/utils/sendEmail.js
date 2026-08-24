// Transactional email via the Brevo REST API.
//
// Sends over HTTPS (port 443) instead of SMTP, so it works on hosts like
// Render/Vercel that block outbound SMTP ports. Node 18+ provides a global
// `fetch`, so no HTTP client dependency is required.
// Docs: https://developers.brevo.com/reference/sendtransacemail

const { redact } = require("./secrets");

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";


/**
 * @param {Object} opts
 * @param {string|string[]} opts.to  Recipient email address(es).
 * @param {string} opts.subject
 * @param {string} opts.html         HTML body.
 * @param {string} [opts.text]       Optional plain-text fallback.
 * @param {string} [opts.replyTo]    Optional Reply-To address.
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Portfolio";

  // Fail soft when unconfigured: callers treat email as best-effort, so a
  // missing key must not throw and break the request that triggered it.
  if (!apiKey || !senderEmail) {
    console.error(
      "Email not sent: BREVO_API_KEY or BREVO_SENDER_EMAIL is missing from the environment.",
    );
    return { success: false, error: "Email service not configured" };
  }

  // Brevo expects recipients as an array of { email } objects.
  const recipients = (Array.isArray(to) ? to : [to])
    .filter(Boolean)
    .map((email) => ({ email }));

  if (recipients.length === 0) {
    return { success: false, error: "No recipient specified" };
  }

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: recipients,
    subject,
    htmlContent: html,
  };
  if (text) payload.textContent = text;
  if (replyTo) payload.replyTo = { email: replyTo };

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Brevo returns a JSON error body (e.g. unverified sender, invalid key).
      // Redact it — an API error body can echo back the key that was sent.
      const detail = await response.text();
      console.error(`Brevo API error (${response.status}):`, redact(detail));
      return { success: false, error: `Brevo responded with ${response.status}` };
    }

    const data = await response.json().catch(() => ({}));
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error("Email error:", redact(error.message));
    return { success: false, error: "Email delivery failed" };
  }
};

module.exports = sendEmail;
