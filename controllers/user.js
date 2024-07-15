import { compare } from 'bcrypt';
import { User } from '../models/user.js'
import { Chat } from '../models/chat.js'
import { Request } from '../models/request.js'
import { cookieOptions, emitEvent, sendToken } from '../utils/common.js';
import { TryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';
import { NEW_REQUEST } from '../constants/events.js';

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
    res.status(200).cookie("pulse-token", "", { ...cookieOptions, maxAge: 0 }).json({
        success: true,
        message: "Logged out successfully"
    });
});

const searchUser = TryCatch(async (req, res) => {

    const { name } = req.query;

    // all my chats
    const myChats = await Chat.find({
        groupChat: false,
        members: req.userId
    })

    // extracted  all users from my chats, means friend or people i have chatted with
    const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

    // all users except me and my friends
    const allUsersExceptMeAndFriends = await User.find({
        _id: { $nin: allUsersFromMyChats },
        name: { $regex: name, $options: 'i' }
    })

    // modifying results
    const users = allUsersExceptMeAndFriends.map(({ _id, name, avatar }) => ({
        _id,
        name,
        avatar: avatar.url
    }))

    res.status(200).json({
        success: true,
        users
    });
});

const sendFriendRequest = TryCatch(async (req, res) => {
    const { userId } = req.body;

    const request = await Request.findOne({})

    if (request) return next(new ErrorHandler('Friend request already sent', 409));

    const newRequest = await Request.create({
        sender: req.userId,
        receiver: userId
    });

    emitEvent(req, NEW_REQUEST, [userId]);

    res.status(200).json({
        success: true,
        message: "Friend Request Sent"
    });
});

export { login, register, getMyProfile, logout, searchUser, sendFriendRequest };