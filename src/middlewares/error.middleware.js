const errorHandler = (err, req, res, next) => {
 
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  //Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
  }

  //Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
  }

  //Express-validator errors (if passed manually)
  if (err.array) {
    statusCode = 400;
    errors = err.array();
    message = "Validation failed";
  }

  //Logging (cleaner)
  if (process.env.NODE_ENV === "development") {
    console.error("ERROR:", err);
  } else {
    console.error("ERROR:", message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;