const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

//get all users

const getAllUsers = async () => {
    const users = await User.find().select("-password");
    return users;
}

const createUser = async (data) => {
        const email = normalizeEmail(data.email);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError(400, "Email already registered");
        }

        const user = await User.create({
            name: data.name,
            email,
            password: data.password,
            role: data.role || "VIEWER",
            status: data.status || "ACTIVE",
        });

        return user;
}

//get user by Id

const getUserById = async (id)=> {
    const user = await User.findById(id).select("-password");

    if(!user) {
        throw new ApiError(404, "User not found");
    }
    return user;
};

//update user role

const updateUserRole = async (id, role) => {
    const user = await User.findById(id);

    if(!user) {
        throw new ApiError(404, "User not found");
    }

        // Guardrail: keep at least one ADMIN in the system.
        if (user.role === "ADMIN" && role !== "ADMIN") {
            const adminCount = await User.countDocuments({ role: "ADMIN" });
            if (adminCount <= 1) {
                throw new ApiError(400, "Cannot demote the last ADMIN user");
            }
        }

    user.role = role;
    await user.save();

    return user;
}

//update user status

const updateUserStatus = async (id, status) => {
    const user = await User.findById(id);

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    // Guardrail: keep at least one ACTIVE ADMIN in the system.
    if (
      user.role === "ADMIN" &&
      user.status === "ACTIVE" &&
      status === "INACTIVE"
    ) {
      const activeAdminCount = await User.countDocuments({
        role: "ADMIN",
        status: "ACTIVE",
      });
      if (activeAdminCount <= 1) {
        throw new ApiError(400, "Cannot deactivate the last ACTIVE ADMIN user");
      }
    }

    user.status = status;
    await user.save();
    return user;
}

const updateCurrentUser = async (currentUser, data) => {
    if (data.name !== undefined) currentUser.name = data.name;
        if (data.email !== undefined) {
            const nextEmail = normalizeEmail(data.email);
            const existing = await User.findOne({ email: nextEmail, _id: { $ne: currentUser._id } });
            if (existing) {
                throw new ApiError(400, "Email already registered");
            }
            currentUser.email = nextEmail;
        }

    await currentUser.save();
    return currentUser;
}

const deactivateUserById = async (id, actingUserId) => {
        const user = await User.findById(id);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (String(user._id) === String(actingUserId)) {
            throw new ApiError(400, "You cannot deactivate your own account");
        }

        if (user.role === "ADMIN" && user.status === "ACTIVE") {
            const activeAdminCount = await User.countDocuments({ role: "ADMIN", status: "ACTIVE" });
            if (activeAdminCount <= 1) {
                throw new ApiError(400, "Cannot deactivate the last ACTIVE ADMIN user");
            }
        }

        user.status = "INACTIVE";
        await user.save();
        return user;
}

module.exports = {
  getAllUsers,
  getUserById,
    createUser,
  updateUserRole,
  updateUserStatus,
  updateCurrentUser,
    deactivateUserById,
};
