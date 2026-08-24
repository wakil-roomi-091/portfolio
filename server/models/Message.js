const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    // Required at creation, but cleared to "" when the sender deletes their
    // account (see anonymizeMessagesForUser). Anonymization goes through
    // updateMany, which does not run validators, so "" is reachable by design.
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isReplied: {
      type: Boolean,
      default: false,
    },
    // Account that submitted the message. Used only to find and anonymize a
    // person's messages when they delete their account; never returned to any
    // client. Null once anonymized, and absent on rows created before this
    // field existed (those fall back to an email match on deletion).
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Message", messageSchema);
