const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["frontend", "backend", "database", "devops", "design", "other"],
      default: "other",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ✅ Unique index on name (prevents duplicates)
skillSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("Skill", skillSchema);
