const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { getOrCreateSettings } = require("./settingsController");
const { sendServerError, redact } = require("../utils/secrets");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Escape user-supplied text before embedding it in notification HTML.
const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

// @desc    Submit contact form
// @route   POST /api/messages
// @access  Public
const createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Link the message to the sender's account so it can be anonymized if they
    // later delete it. The route is behind `auth`, so req.userId is always set.
    const newMessage = new Message({
      name,
      email,
      subject,
      message,
      user: req.userId,
    });
    await newMessage.save();

    // Respond immediately; email delivery is best-effort and must not
    // block the request or fail it if the mail service is down.
    res.status(201).json({ message: "Message sent successfully" });

    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      subject: escapeHtml(subject),
      message: escapeHtml(message).replace(/\n/g, "<br/>"),
    };

    // Notification preferences come from the Settings singleton. Loading them
    // is best-effort: the 201 response was already sent, so on failure fall
    // back to env defaults rather than crashing the (already answered) request.
    let settings = null;
    try {
      settings = await getOrCreateSettings();
    } catch (err) {
      console.error(
        "Could not load settings for notifications:",
        redact(err.message),
      );
    }

    const notifyAdmin = settings ? settings.emailNotifications : true;
    const sendAutoReply = settings ? settings.autoReply : true;
    const adminRecipient =
      (settings && settings.notificationEmail) || process.env.ADMIN_EMAIL;

    // Notify admin. replyTo is the sender's address so hitting "Reply" in the
    // inbox goes straight back to them rather than to the Brevo sender.
    if (notifyAdmin && adminRecipient) {
      sendEmail({
        to: adminRecipient,
        replyTo: email,
        subject: `[Portfolio] New message from ${safe.name}`,
        html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safe.name}</p>
        <p><strong>Email:</strong> ${safe.email}</p>
        <p><strong>Subject:</strong> ${safe.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${safe.message}</p>
      `,
      })
        .then((r) =>
          r.success
            ? console.log(`Admin notification sent (Brevo id: ${r.messageId})`)
            : console.error("Admin notification NOT sent:", redact(r.error)),
        )
        .catch((err) =>
          console.error("Admin notification error:", redact(err.message)),
        );
    }

    // Auto-reply to sender.
    //
    // The submitted `email` is free-text, so it is NOT used as the recipient
    // here — otherwise any logged-in user could make the site send mail from
    // its verified sender to an arbitrary address. The auto-reply goes only to
    // the address on the authenticated account, and only once that address has
    // been confirmed: signup alone proves nothing, so without the
    // `emailVerified` gate someone could still register a stranger's address
    // and have the site mail them.
    if (sendAutoReply) {
      let accountEmail = null;
      try {
        const account = await User.findById(req.userId).select(
          "email emailVerified",
        );
        accountEmail = account?.emailVerified ? account.email : null;
      } catch (err) {
        console.error(
          "Could not load account for auto-reply:",
          redact(err.message),
        );
      }

      if (accountEmail) {
        sendEmail({
          to: accountEmail,
          subject: "Thank you for your message",
          html: `
        <h2>Thank you for reaching out!</h2>
        <p>Hi ${safe.name},</p>
        <p>I've received your message and will get back to you within 24 hours.</p>
        <p>Best regards,<br/>Roomi</p>
      `,
        })
          // Never log the recipient address — the Brevo message id is enough to
          // trace a delivery, and it carries no personal data.
          .then((r) =>
            r.success
              ? console.log(`Auto-reply sent (Brevo id: ${r.messageId})`)
              : console.error("Auto-reply NOT sent:", redact(r.error)),
          )
          .catch((err) =>
            console.error("Auto-reply error:", redact(err.message)),
          );
      }
    }
  } catch (error) {
    sendServerError(res, error, "createMessage");
  }
};

// Exactly the fields the admin inbox renders. `user` (the sender's account id)
// and `__v` are internal and never leave the server.
const MESSAGE_FIELDS = "name email subject message isRead createdAt";

// @desc    Get all messages
// @route   GET /api/messages
// @access  Private (Admin)
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .select(MESSAGE_FIELDS)
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    sendServerError(res, error, "getMessages");
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private (Admin)
const markAsRead = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: "Message not found" });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    message.isRead = true;
    await message.save();
    res.json({ message: "Message marked as read" });
  } catch (error) {
    sendServerError(res, error, "markAsRead");
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private (Admin)
const deleteMessage = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: "Message not found" });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    await message.deleteOne();
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    sendServerError(res, error, "deleteMessage");
  }
};

// @desc    Delete all messages
// @route   DELETE /api/messages
// @access  Private (Admin)
const deleteAllMessages = async (req, res) => {
  try {
    const result = await Message.deleteMany({});
    res.json({
      message: "All messages deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    sendServerError(res, error, "deleteAllMessages");
  }
};

module.exports = {
  createMessage,
  getMessages,
  markAsRead,
  deleteMessage,
  deleteAllMessages,
};
