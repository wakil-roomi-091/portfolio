const Profile = require("../models/Profile");
const cloudinary = require("../config/cloudinary");
const { sendServerError, redact } = require("../utils/secrets");

// `GET /api/profile` is public, so it returns only what the site renders.
// The Cloudinary public ids (internal asset handles used for delete/replace)
// and Mongo bookkeeping fields (__v, timestamps) stay server-side.
const publicProfile = (profile) => ({
  name: profile.name,
  title: profile.title,
  location: profile.location,
  education: profile.education,
  aboutHeading: profile.aboutHeading,
  aboutP1: profile.aboutP1,
  aboutP2: profile.aboutP2,
  stats: (profile.stats || []).map(({ num, lab }) => ({ num, lab })),
  social: {
    github: profile.social?.github || "",
    linkedin: profile.social?.linkedin || "",
    email: profile.social?.email || "",
  },
  profileImage: profile.profileImage,
  cvUrl: profile.cvUrl,
});

// Best-effort Cloudinary delete: a failure here must not fail the request, but
// it must be visible in the logs (an orphaned CV stays publicly downloadable).
const destroyAsset = async (publicId, resourceType) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (cloudinaryError) {
    console.warn(
      `Could not delete Cloudinary ${resourceType} asset:`,
      redact(cloudinaryError.message),
    );
  }
};

const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile();
      await profile.save();
    }
    res.json(publicProfile(profile));
  } catch (error) {
    sendServerError(res, error, "getProfile");
  }
};

const updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile();
    }

    const {
      name,
      title,
      location,
      education,
      aboutHeading,
      aboutP1,
      aboutP2,
      stats,
      social,
      profileImage,
      cvUrl,
    } = req.body;

    if (name !== undefined) profile.name = name;
    if (title !== undefined) profile.title = title;
    if (location !== undefined) profile.location = location;
    if (education !== undefined) profile.education = education;
    if (aboutHeading !== undefined) profile.aboutHeading = aboutHeading;
    if (aboutP1 !== undefined) profile.aboutP1 = aboutP1;
    if (aboutP2 !== undefined) profile.aboutP2 = aboutP2;
    if (stats !== undefined) profile.stats = stats;
    if (social !== undefined) profile.social = social;

    // The admin panel removes an asset by clearing its URL. Honour that here
    // and delete the backing file — otherwise a "removed" CV stays downloadable
    // from Cloudinary and keeps being served on the public site, and a CV holds
    // real personal data (name, email, phone, location).
    //
    // Only the clear case is handled; new files arrive via the upload routes.
    if (profileImage === "" && profile.profileImage) {
      await destroyAsset(profile.profileImagePublicId, "image");
      profile.profileImage = "";
      profile.profileImagePublicId = "";
    }
    if (cvUrl === "" && profile.cvUrl) {
      await destroyAsset(profile.cvPublicId, "raw");
      profile.cvUrl = "";
      profile.cvPublicId = "";
    }

    await profile.save();
    res.json(publicProfile(profile));
  } catch (error) {
    sendServerError(res, error, "updateProfile");
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile();
    }

    await destroyAsset(profile.profileImagePublicId, "image");

    profile.profileImage = req.file.path;
    profile.profileImagePublicId = req.file.filename;
    await profile.save();

    // The public id is an internal handle — the client only needs the URL.
    res.json({ success: true, profileImage: profile.profileImage });
  } catch (error) {
    sendServerError(res, error, "uploadProfileImage");
  }
};

// Upload the CV. The multer `cvStorage` engine has already streamed the file to
// Cloudinary as a raw asset by the time we get here (req.file.path is the URL,
// req.file.filename the public id), so use it directly. An earlier version
// re-uploaded req.file.path a second time and tracked only the copy, leaving the
// first upload as an untracked, publicly downloadable orphan of a PII document.
const uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile();
    }

    // Delete the previous CV (raw resource) before pointing at the new one.
    await destroyAsset(profile.cvPublicId, "raw");

    profile.cvUrl = req.file.path;
    profile.cvPublicId = req.file.filename;
    await profile.save();

    // The public id is an internal handle — the client only needs the URL.
    res.json({ success: true, cvUrl: profile.cvUrl });
  } catch (error) {
    sendServerError(res, error, "uploadCV", "Error uploading CV");
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  uploadCV,
};
