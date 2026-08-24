const mongoose = require("mongoose");

// Site-wide settings are stored as a single (singleton) document, mirroring
// the Profile model. `getOrCreateSettings` in the controller seeds it on first
// read so the doc always exists.
const settingsSchema = new mongoose.Schema(
  {
    // Site & SEO
    siteTitle: { type: String, default: "" },
    siteDescription: { type: String, default: "" },

    // Contact & notifications
    notificationEmail: { type: String, default: "" }, // overrides ADMIN_EMAIL when set
    emailNotifications: { type: Boolean, default: true }, // notify admin on new message
    autoReply: { type: Boolean, default: true }, // auto-reply to the sender

    // Appearance (applied to the public site)
    defaultTheme: {
      type: String,
      enum: ["system", "light", "dark"],
      default: "system",
    },
    accent: { type: String, default: "indigo-cyan" }, // preset key, see client appearance util
  },
  { timestamps: true },
);

module.exports = mongoose.model("Settings", settingsSchema);
