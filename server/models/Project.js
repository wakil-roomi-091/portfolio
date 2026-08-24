const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
      enum: ['cover-1', 'cover-2', 'cover-3', 'cover-4'],
      default: 'cover-1',
    },
    span: {
      type: String,
      enum: ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-6'],
      default: 'lg:col-span-6',
    },
    description: {
      type: String,
      required: true,
    },
    stack: {
      type: [String],
      required: true,
    },
    demo: {
      type: String,
      default: null,
    },
    github: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    // ✅ NEW: Array for multiple images
    images: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);