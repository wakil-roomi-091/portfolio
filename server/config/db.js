const mongoose = require("mongoose");
const { redact } = require("../utils/secrets");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // Log the host only — never the full URI, which contains the password.
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Auth/DNS failures put the entire connection string, credentials
    // included, into error.message. Redact before it reaches the log.
    console.error(`MongoDB connection error: ${redact(error.message)}`);
    process.exit(1);
  }
};

module.exports = connectDB;
