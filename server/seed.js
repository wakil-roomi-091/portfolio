require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
const User = require("./models/User");
const { redact } = require("./utils/secrets");

// Bootstraps (or repairs) the admin account from ADMIN_EMAIL / ADMIN_PASSWORD.
//
// This script is the ONLY way an account becomes an admin. Registration always
// creates a plain user — it used to hand out the admin role to whoever signed up
// with ADMIN_EMAIL, which meant anyone who knew that address (it is printed on
// the public contact page) could claim the admin account on a fresh deploy.
const seedAdmin = async () => {
  try {
    if (!process.env.ADMIN_EMAIL) {
      console.error("❌ ADMIN_EMAIL is not set in the environment");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const email = String(process.env.ADMIN_EMAIL).trim().toLowerCase();

    // If the owner already has a normal account on that address, promote it in
    // place rather than creating a second one. This is the supported way to
    // recover an install where the old registration behaviour was relied on.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role === "admin" && existingUser.emailVerified) {
        console.log("✅ Admin user already set up (ADMIN_EMAIL)");
        process.exit(0);
      }

      existingUser.role = "admin";
      existingUser.emailVerified = true;
      existingUser.isActive = true;
      await existingUser.save();
      console.log("✅ Promoted the existing ADMIN_EMAIL account to admin");
      process.exit(0);
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("✅ Admin already exists (ADMIN_EMAIL) — log in to activate");
      process.exit(0);
    }

    if (!process.env.ADMIN_PASSWORD) {
      console.error("❌ ADMIN_PASSWORD is not set in the environment");
      process.exit(1);
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const admin = new Admin({ email, password: hashedPassword });
    await admin.save();

    // Don't echo the address — logs get shipped, tailed and pasted around.
    console.log("✅ Admin created successfully for ADMIN_EMAIL");
    console.log("   Log in once with those credentials to activate the account.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", redact(error.message));
    process.exit(1);
  }
};

seedAdmin();
