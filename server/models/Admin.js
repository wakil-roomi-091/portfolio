const mongoose = require("mongoose");

// Legacy model kept only so pre-existing admin accounts can still log in; the
// login handler migrates them into `User` on first successful sign-in.
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  // bcrypt hash — hidden by default, same rule as User.password.
  password: {
    type: String,
    required: true,
    select: false,
  },
});

module.exports = mongoose.model("Admin", adminSchema);
