import { compare } from 'bcrypt';
import { User } from '../models/user.js'
import { cookieOptions, sendToken } from '../utils/common.js';
import { TryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

// create the new user and save it to the database and save in cookies and save token
const register = async (req, res) => {

    const { name, username, password, bio } = req.body;

    const avatar = {
        public_id: "https://google.com",
        url: "https://www.google.com"
    }

    const user = await User.create({
        name,
        username,
        password,
        bio,
        avatar
    })

    sendToken(res, user, 201, "User created successfully")
}

// login the user and save in cookies and save token
const login = TryCatch(
    async (req, res, next) => {
        const { username, password } = req.body;
        // find the user by username and validate password
        const user = await User.findOne({ username }).select("+password");

        if (!user) return next(new ErrorHandler('Invalid Username or Password', 404));

        const isMatch = await compare(password, user.password);
        if (!isMatch) return next(new ErrorHandler('Invalid Username or Password', 404));

        sendToken(res, user, 200, `Welcome Back, ${user.name}`);
    }
);

const getMyProfile = TryCatch(async (req, res) => {
    const user = await User.findById(req.userId);
    res.status(200).json({
        success: true,
        user
    });
});

const logout = TryCatch(async (req, res) => {
    res.status(200).cookie("pulse-token", "", {...cookieOptions, maxAge: 0}).json({
        success: true,
        message: "Logged out successfully"
    });
});

const searchUser = TryCatch(async (req, res) => {

    const { name } = req.query;

    res.status(200).json({
        success: true,
        message: name
    });
});

export { login, register, getMyProfile, logout, searchUser };