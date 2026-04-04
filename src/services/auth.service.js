const User = require("../models/user.model");

const registerUser = async (name, email, password, role) => {
    const existingUser = await User.findOne({email});

    if (existingUser) {
      throw new Error("Email already registered");
    }

    const user = await User.create({
        name,
        email,
        password,
        role
    });
    await user.save();
    return user;
}

const loginUser = async (email, password) => {
    const user = await User.findOne({email});

    if(!user) {
        throw  new Error("Invalid Credentials");
    }

    if (user.status ==="INACTIVE") {
      throw new Error("Account is inactive");
    }

    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        throw new Error("Invalid credentials");
    }
    return user;
};

module.exports = { registerUser, loginUser}