const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies a JWT and attaches the authenticated user's info to the request.
//
// A valid signature is not enough on its own: the account behind the token can
// have been deleted, disabled, or had its password changed since the token was
// issued. All three are checked here against the database, so revocation is
// immediate rather than waiting out the token's 7-day expiry.
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // One read per request. `role` is taken from here rather than from the token
    // claim, so a demotion takes effect at once and requireAdmin needs no
    // second query.
    const user = await User.findById(decoded.id).select(
      "role isActive passwordChangedAt",
    );

    // Account deleted (or a token signed for an id that never existed).
    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been disabled" });
    }

    // Reject tokens issued before the last password change. `iat` is in whole
    // seconds, so allow one second of slack — otherwise the very token we hand
    // back from changePassword could be rejected by its own rounding.
    if (
      user.passwordChangedAt &&
      decoded.iat * 1000 + 1000 < user.passwordChangedAt.getTime()
    ) {
      return res
        .status(401)
        .json({ message: "Session expired, please log in again" });
    }

    req.userId = user._id;
    req.user = { id: user._id, role: user.role };

    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Must run after `auth`, which has already read the current role from the
// database — so a token whose role claim is stale cannot be used here.
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { auth, requireAdmin };
