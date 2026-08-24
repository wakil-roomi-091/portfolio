const mongoose = require("mongoose");
const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary");
const { sendServerError } = require("../utils/secrets");

// Only these fields may be set by a client — prevents mass assignment.
const ALLOWED_FIELDS = [
  "title",
  "tag",
  "cover",
  "span",
  "description",
  "stack",
  "demo",
  "github",
  "image",
  "imagePublicId",
  "images",
  "order",
  "isActive",
];

const pickAllowed = (body) => {
  const data = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isActive: true })
      .sort({ order: 1 })
      .select("-__v");
    res.json(projects);
  } catch (error) {
    sendServerError(res, error, "getProjects");
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProject = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: "Project not found" });
    }

    const project = await Project.findById(req.params.id).select("-__v");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    sendServerError(res, error, "getProject");
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private (Admin)
const createProject = async (req, res) => {
  try {
    const project = new Project(pickAllowed(req.body));
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    // Schema validation messages are ours to show; anything else is internal.
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    sendServerError(res, error, "createProject");
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin)
const updateProject = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: "Project not found" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only delete the old Cloudinary image when a genuinely different image is
    // uploaded. The edit form resends the existing image URL on every save, so
    // guarding on truthiness alone destroyed the still-referenced asset on any
    // edit (e.g. a title change), breaking the picture on the live site.
    if (
      req.body.image &&
      req.body.image !== project.image &&
      project.imagePublicId
    ) {
      await cloudinary.uploader.destroy(project.imagePublicId);
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      pickAllowed(req.body),
      { new: true, runValidators: true },
    );
    res.json(updated);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    sendServerError(res, error, "updateProject");
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
const deleteProject = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: "Project not found" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Delete image from Cloudinary
    if (project.imagePublicId) {
      await cloudinary.uploader.destroy(project.imagePublicId);
    }

    await project.deleteOne();
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    sendServerError(res, error, "deleteProject");
  }
};

// @desc    Upload project images (single or multiple)
// @route   POST /api/projects/upload
// @access  Private (Admin)
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const images = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    res.json({
      success: true,
      images,
    });
  } catch (error) {
    sendServerError(res, error, "uploadImages");
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  uploadImages,
};
