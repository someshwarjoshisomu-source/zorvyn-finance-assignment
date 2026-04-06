const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Enforce ACTIVE status
    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    req.user = user; // attach full user

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

module.exports = authenticate;
