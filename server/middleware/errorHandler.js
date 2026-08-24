const { redact } = require("../utils/secrets");

const errorHandler = (err, req, res, next) => {
  // Redact before logging: driver/network errors can carry the connection
  // string or an Authorization header in the stack.
  console.error(redact(err.stack || err));

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      message: "Duplicate entry",
      field: Object.keys(err.keyPattern || {})[0],
    });
  }

  // Mongoose validation error — messages come from our own schema definitions,
  // so they are safe to return verbatim.
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: errors.join(", ") });
  }

  // Multer / upload rejections carry their own client-safe messages.
  if (err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }

  const status = err.status || 500;

  // Never hand a raw internal message to the client on a 5xx. Deliberate 4xx
  // errors thrown by our own code (e.g. the CORS rejection) keep their text.
  const message =
    status < 500
      ? err.message
      : process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again later."
        : redact(err.message || "Something went wrong");

  res.status(status).json({ message });
};

module.exports = errorHandler;
