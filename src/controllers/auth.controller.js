const authService = require("../services/auth.service");
const generateToken = require("../utils/generateToken");

const register = async (req, res, next) => {
    try {
        const { name, email, password, role} = req.body;

        const user = await authService.registerUser(name, email, password, role);

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    }catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await authService.loginUser(email, password);

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success:true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        })
    }catch(err){
        next(err)
    }
};


module.exports = {register, login };