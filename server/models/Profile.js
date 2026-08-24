const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    title: { type: String, default: "" },
    location: { type: String, default: "" },
    education: { type: String, default: "" },
    aboutHeading: { type: String, default: "" },
    aboutP1: { type: String, default: "" },
    aboutP2: { type: String, default: "" },
    stats: {
      type: [
        {
          num: { type: String, required: true },
          lab: { type: String, required: true },
        },
      ],
      default: [
        { num: "", lab: "" },
        { num: "", lab: "" },
        { num: "", lab: "" },
      ],
    },
    social: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    profileImage: { type: String, default: "" },
    profileImagePublicId: { type: String, default: "" },
    cvUrl: { type: String, default: "" },
    cvPublicId: { type: String, default: "" },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Profile", profileSchema);
