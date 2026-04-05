const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new ApiError(
        400,
        "Validation failed",
        errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      ),
    );
  }

  next();
};

module.exports = validate;