const { validationResult } = require("express-validator");

// Runs after express-validator rule chains and returns 400 if any failed.
// Without this, the rule chains declared in the route files do nothing.
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const details = errors.array();
    return res.status(400).json({
      message: details[0].msg,
      errors: details.map((e) => ({ field: e.path, message: e.msg })),
    });
  }

  next();
};

module.exports = validate;
