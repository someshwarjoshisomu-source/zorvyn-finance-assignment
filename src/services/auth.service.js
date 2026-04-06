const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

const registerUser = async (name, email, password) => {
    const existingUser = await User.findOne({email});

    if (existingUser) {
      throw new ApiError(400, "Email already registered");
    }

    const user = await User.create({
        name,
        email,
        password,
        role: "VIEWER",
    });

    return user;
}

const loginUser = async (email, password) => {
    const user = await User.findOne({email});

    if(!user) {
        throw new ApiError(401, "Invalid Credentials");
    }

    if (user.status ==="INACTIVE") {
      throw new ApiError(403, "Account is inactive");
    }

    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        throw new ApiError(401, "Invalid Credentials");
    }

    return user;
};

module.exports = { registerUser, loginUser}
