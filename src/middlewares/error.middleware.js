const AppError = require("../utils/AppError");

const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors = null;
  let isOperational = false;

  // Check if it's an AppError (operational error)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
    isOperational = err.isOperational;
  } else {
    // Mongoose CastError (invalid ObjectId)
    if (err.name === "CastError") {
      statusCode = 400;
      message = "Invalid resource ID";
      isOperational = true;
    }
    // Mongoose Validation Error
    else if (err.name === "ValidationError") {
      statusCode = 400;
      message = Object.values(err.errors)
        .map((val) => val.message)
        .join(", ");
      isOperational = true;
    }
    // Duplicate key error
    else if (err.code === 11000) {
      statusCode = 400;
      message = "Duplicate field value entered";
      isOperational = true;
    }
    // Express-validator errors
    else if (err.array) {
      statusCode = 400;
      errors = err.array();
      message = "Validation failed";
      isOperational = true;
    }
  }

  // Logging
  if (process.env.NODE_ENV === "development") {
    console.error("ERROR:", err);
  } else {
    console.error(`[ERROR] ${statusCode} - ${message}`);
  }

  // Response
  res.status(statusCode).json({
    success: false,
    message: isOperational ? message : "Internal Server Error",
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
