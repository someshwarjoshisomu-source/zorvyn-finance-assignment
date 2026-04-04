const User = require("../models/user.model")

//get all users

const getAllUsers = async () => {
    const users = await User.find().select("-password");
    return users;
}

//get user by Id

const getUserById = async (id)=> {
    const user = await User.findById(id).select("-password");

    if(!user) {
        throw new Error("User not found");
    }
    return user;
};

//update user role

const updateUserRole = async (id, role) => {
    const user = await User.findById(id);

    if(!user) {
        throw new Error("User not found");
    }

    user.role = role;
    await user.save();

    return user;
}

//update user status

const updateUserStatus = async (id, status) => {
    const user = await User.findById(id);

    if(!user) {
        throw new Error("User not found");
    }

    user.status = status;
    await user.save();
    return user;
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
};