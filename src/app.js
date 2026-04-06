const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const helmet = require("helmet");
const crypto = require("crypto");

const packageJson = require("../package.json");

const errorHandler = require("./middlewares/error.middleware");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const recordRoutes = require("./routes/record.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();

const startedAt = new Date();
const bootId = crypto.randomUUID();
const sourceRevision = process.env.SOURCE_REV || "dev-local";

app.locals.runtime = {
  startedAt,
  bootId,
  sourceRevision,
  appVersion: packageJson.version,
};

//Add security headers
app.use(helmet());

// Logging: Request logging
app.use(morgan("dev"));

// Middlewares
app.use(cors());
app.use(express.json());

// Rate limiter for API routes - using with higher limit to avoid false positives
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased from 100 to 500 for better UX
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: false, // Return rate limit info in the `RateLimit-*` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter EXCEPT to auth endpoints in development
if (process.env.NODE_ENV === "production") {
  app.use("/api", limiter);
} else {
  // In development, exclude auth endpoints from rate limiting  
  app.use("/api", (req, res, next) => {
    if (req.path.startsWith("/auth")) {
      return next();
    }
    limiter(req, res, next);
  });
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Zorvyn Finance API" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    healthy: true,
    uptimeSeconds: Math.floor(process.uptime()),
    startedAt: app.locals.runtime.startedAt,
    bootId: app.locals.runtime.bootId,
  });
});

app.get("/api/version", (req, res) => {
  res.status(200).json({
    success: true,
    app: "zorvyn",
    version: app.locals.runtime.appVersion,
    sourceRevision: app.locals.runtime.sourceRevision,
    bootId: app.locals.runtime.bootId,
    startedAt: app.locals.runtime.startedAt,
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
