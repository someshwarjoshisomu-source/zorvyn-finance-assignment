const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const errorHandler = require("./middlewares/error.middleware")

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const recordRoutes = require("./routes/record.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rate limiter for API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});
app.use('/api', limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Zorvyn Finance API"});
})

// Error handler
app.use(errorHandler);

module.exports = app;