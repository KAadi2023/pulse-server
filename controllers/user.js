import { compare } from 'bcrypt';
import { User } from '../models/user.js'
import { Chat } from '../models/chat.js'
import { Request } from '../models/request.js'
import { cookieOptions, emitEvent, sendToken } from '../utils/common.js';
import { TryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';
import { NEW_REQUEST, REFETCH_CHATS } from '../constants/events.js';
import { getOtherMember } from "../lib/helper.js"

// create the new user and save it to the database and save in cookies and save token
const register = TryCatch(async (req, res, next) => {

    const { name, username, password, bio } = req.body;

    const file = req.file;
    if (!file) return next(new ErrorHandler('Please upload an avatar', 400));

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
})

// login the user and save in cookies and save token
const login = TryCatch(async (req, res, next) => {
    const { username, password } = req.body;
    // find the user by username and validate password
    const user = await User.findOne({ username }).select("+password");

    if (!user) return next(new ErrorHandler('Invalid Username or Password', 404));

    const isMatch = await compare(password, user.password);
    if (!isMatch) return next(new ErrorHandler('Invalid Username or Password', 404));

    sendToken(res, user, 200, `Welcome Back, ${user.name}`);
}
);

const getMyProfile = TryCatch(async (req, res, next) => {
    const user = await User.findById(req.userId);
    if (!user) return next(new ErrorHandler('User not found', 404));
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

const searchUser = TryCatch(async (req, res, next) => {

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

const sendFriendRequest = TryCatch(async (req, res, next) => {
    const { userId } = req.body;

    const request = await Request.findOne({
        $or: [
            {
                sender: req.userId,
                receiver: userId
            },
            {
                sender: userId,
                receiver: req.userId
            }
        ]
    })

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

const acceptFriendRequest = TryCatch(async (req, res, next) => {
    const { requestId, accept } = req.body;

    const request = await Request.findById(requestId)
        .populate("sender", "name")
        .populate("receiver", "name");

    if (!request) return next(new ErrorHandler('Request not found', 404));
    if (request.receiver._id.toString() !== req.userId.toString()) return next(new ErrorHandler('You are not authorized to accept this request', 401));
    if (!accept) {
        await request.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Friend Request rejected"
        });
    }

    const members = [
        request.sender._id,
        request.receiver._id
    ]
    await Promise.all([
        Chat.create({
            members,
            name: `${request.sender.name}-${request.receiver.name}`
        }),
        request.deleteOne()
    ])

    emitEvent(req, REFETCH_CHATS, members);

    res.status(200).json({
        success: true,
        message: "Friend Request Accepted",
        senderId: request.sender._id
    });
});

const getMyNotifications = TryCatch(async (req, res) => {
    const requests = await Request.find({ receiver: req.userId })
        .populate("sender", "name avatar");

    const allRequests = requests.map(({ _id, sender }) => ({
        _id,
        sender: {
            _id: sender._id,
            name: sender.name,
            avatar: sender.avatar.url
        }
    }));

    return res.status(200).json({
        success: true,
        requests: allRequests
    });
});

const getMyFriends = TryCatch(async (req, res, next) => {
    const chatId = req.query.chatId;

    const chats = await Chat.find({
        members: req.userId,
        groupChat: false
    }).populate("members", "name avatar");

    const friends = chats.map(({ members }) => {
        const otherUser = getOtherMember(members, req.userId)

        return {
            _id: otherUser._id,
            name: otherUser.name,
            avatar: otherUser.avatar.url
        }
    });

    if (chatId) {
        const chat = await Chat.findById(chatId);

        if (!chat) return next(new ErrorHandler('Chat not found', 404));
        const availableFriends = friends.filter(
            (friend) => !chat.members.includes(friend._id)
        );

        res.status(200).json({
            success: true,
            friends: availableFriends
        });

    } else {
        return res.status(200).json({
            success: true,
            friends
        });
    }
});

export {
    login,
    logout,
    register,
    searchUser,
    getMyProfile,
    sendFriendRequest,
    acceptFriendRequest,
    getMyNotifications,
    getMyFriends
};