const express = require("express");
const {
  createMessage,
  getMessages,
  markAsRead,
  deleteMessage,
  deleteAllMessages,
} = require("../controllers/messageController");
const { auth, requireAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { contactLimiter } = require("../middleware/rateLimit");
const { body } = require("express-validator");

const router = express.Router();

// @route   POST /api/messages  (contact form — requires login)
router.post(
  "/",
  auth,
  contactLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  validate,
  createMessage,
);

// Admin only
router.get("/", auth, requireAdmin, getMessages);
router.put("/:id/read", auth, requireAdmin, markAsRead);
router.delete("/", auth, requireAdmin, deleteAllMessages);
router.delete("/:id", auth, requireAdmin, deleteMessage);

module.exports = router;
