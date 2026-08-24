const Settings = require("../models/Settings");
const { sendServerError } = require("../utils/secrets");

// Settings is a singleton — find the one document or create it with defaults.
// Exported so other controllers (e.g. messages) can read notification prefs.
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings();
    await settings.save();
  }
  return settings;
};

// @desc    Public-safe site settings for the public site
// @route   GET /api/settings
// @access  Public
const getPublicSettings = async (req, res) => {
  try {
    const s = await getOrCreateSettings();
    // Only expose display/appearance fields — never the notification email.
    res.json({
      siteTitle: s.siteTitle,
      siteDescription: s.siteDescription,
      defaultTheme: s.defaultTheme,
      accent: s.accent,
    });
  } catch (error) {
    sendServerError(res, error, "getPublicSettings");
  }
};

// Everything the admin panel edits — and nothing else. Keeps Mongo internals
// (_id, __v, timestamps) out of the response.
const adminSettings = (s) => ({
  siteTitle: s.siteTitle,
  siteDescription: s.siteDescription,
  notificationEmail: s.notificationEmail,
  emailNotifications: s.emailNotifications,
  autoReply: s.autoReply,
  defaultTheme: s.defaultTheme,
  accent: s.accent,
});

// @desc    Full settings for the admin panel
// @route   GET /api/settings/all
// @access  Private (Admin)
const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(adminSettings(settings));
  } catch (error) {
    sendServerError(res, error, "getSettings");
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    const {
      siteTitle,
      siteDescription,
      notificationEmail,
      emailNotifications,
      autoReply,
      defaultTheme,
      accent,
    } = req.body;

    if (siteTitle !== undefined) settings.siteTitle = siteTitle;
    if (siteDescription !== undefined) settings.siteDescription = siteDescription;
    if (notificationEmail !== undefined)
      settings.notificationEmail = notificationEmail;
    if (emailNotifications !== undefined)
      settings.emailNotifications = emailNotifications;
    if (autoReply !== undefined) settings.autoReply = autoReply;
    if (defaultTheme !== undefined) settings.defaultTheme = defaultTheme;
    if (accent !== undefined) settings.accent = accent;

    await settings.save();
    res.json(adminSettings(settings));
  } catch (error) {
    sendServerError(res, error, "updateSettings");
  }
};

module.exports = {
  getOrCreateSettings,
  getPublicSettings,
  getSettings,
  updateSettings,
};
