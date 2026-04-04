const express = require("express");
const cors = require("cors");

const errorHandler = require("./middlewares/error.middleware")

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const recordRoutes = require("./routes/record.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());


//routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Zorvyn Finance API"});
})

//Error handler
app.use(errorHandler);

module.exports = app;