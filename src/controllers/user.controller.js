const userService = require("../services/user.service")

const getUsers = async (req, res, next)=>{
    try{
        const users = await userService.getAllUsers();

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    }catch(err){
        next(err);
    }
};

const getUser = async (req, res, next)=>{
    try{
        const user = await userService.getUserById(req.params.id);
        res.status(200).json({
            success:true,
            user
        });
    }catch(err){
        next(err);
    }
};

const updateRole = async (req, res, next) => {
    try {
        const user = await userService.updateUserRole(
            req.params.id,
            req.body.role
        );
        res.status(200).json({
            success:true,
            user
        });
    }catch(err){
        next(err);
    }
}
const updateStatus = async (req, res, next) => {
    try {
        const user = await userService.updateUserStatus(
            req.params.id,
            req.body.status
        );
        res.status(200).json({
            success:true,
            user
        });
    }catch(err){
        next(err);
    }
}

module.exports = {
  getUsers,
  getUser,
  updateRole,
  updateStatus
};