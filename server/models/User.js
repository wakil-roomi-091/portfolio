const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    // bcrypt hash. `select: false` keeps it out of every query result unless a
    // caller explicitly asks for it with .select("+password") — so a hash can
    // never reach an API response by accident, even via res.json(user).
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      // Never settable from a request body. The first admin comes from
      // `npm run seed`; any further promotion is a deliberate DB change.
      // See authController.register — registration always creates a "user".
    },
    // Set false to lock an account out. Enforced in the auth middleware and on
    // login, so an existing token stops working immediately. There is no UI for
    // this yet — it is toggled directly in the database.
    isActive: {
      type: Boolean,
      default: true,
    },
    // Bumped on every password change. The auth middleware rejects any token
    // issued before this instant, so changing your password really does end all
    // other sessions (a stolen token is otherwise valid for its full 7 days).
    //
    // Not `select: false`: it is harmless to read internally, and every response
    // is built from an explicit field allowlist, so it cannot leak by accident.
    //
    // Deliberately has NO `default: Date.now`. A *function* default is re-applied
    // at load time to any document missing the field, so Mongoose would stamp it
    // with the current time on every read — making every token look older than
    // the last "password change" and 401-ing every authenticated request. An
    // absent value means "password never changed", which the middleware treats as
    // "allow" (it guards with `user.passwordChangedAt && …`). changePassword sets
    // it explicitly when a change actually happens.
    passwordChangedAt: {
      type: Date,
    },
    // Proof the person registering actually controls this address. Unverified
    // accounts can still sign in and use the site; what they cannot do is make
    // the site send mail to the address (see messageController's auto-reply),
    // which is what stops signup being used to email strangers.
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // SHA-256 of the token in the verification link — never the token itself, so
    // a database leak can't be used to verify someone else's address.
    emailVerifyTokenHash: {
      type: String,
      select: false,
    },
    emailVerifyExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
