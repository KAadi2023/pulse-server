import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";


const allUsers = TryCatch(async (req, res) => {
    const users = await User.find({});

    const transformedUsers = await Promise.all(
        users.map(async ({ name, username, avatar, _id }) => {

            const [groups, friends] = await Promise.all([
                Chat.countDocuments({
                    groupChat: true,
                    members: _id
                }),
                Chat.countDocuments({
                    groupChat: false,
                    members: _id
                }),
            ])

            return {
                _id,
                name,
                username,
                avatar: avatar.url,
                groups,
                friends
            }
        })
    );


    return res.status(200).json({
        success: true,
        users: transformedUsers,
    })
})

const allChats = TryCatch(async (req, res) => {
    const chats = await Chat.find({})
        .populate("members", "name avatar")
        .populate("creator", "name avatar")

    const transformedChats = await Promise.all(
        chats.map(async ({ _id, name, groupChat, members, creator }) => {
            const totalMessages = await Message.countDocuments({ chat: _id })
            return {
                _id,
                name,
                avatar: members.slice(0, 3).map((member) => member.avatar.url),
                members: members.map(({ _id, name, avatar }) => ({
                    _id,
                    name,
                    avatar: avatar.url
                })),
                creator: {
                    name: creator?.name || "None",
                    avatar: creator?.avatar.url || ""
                },
                totalMembers: members.length,
                totalMessages
            }
        })
    )

    return res.status(200).json({
        success: true,
        chats: transformedChats,
    })
})

const allMessages = TryCatch(async (req, res) => {
    const messages = await Message.find({})
        .populate("sender", "name avatar")
        .populate("chat", "groupChat")

    const transformedMessages = messages.map(({ _id, content, attachments, sender, createdAt, chat }) => ({
        _id,
        content,
        attachments,
        createdAt: new Date(createdAt).toISOString(),
        sender: {
            _id: sender._id,
            name: sender.name,
            avatar: sender.avatar.url
        },
        chat: {
            _id: chat._id,
            groupChat: chat.groupChat,
        }
    }))

    return res.status(200).json({
        success: true,
        messages: transformedMessages,
    })
});

const getDashboardStats = TryCatch(async (req, res) => {
    const [totalUsers, totalChats, totalMessages, totalGroups] = await Promise.all([
        User.countDocuments(),
        Chat.countDocuments(),
        Message.countDocuments(),
        Chat.countDocuments({ groupChat: true }),
    ])
    const today = new Date();
    const last7days = new Date();
    last7days.setDate(last7days.getDate() - 7);

    const last7daysMessages = await Message.find({
        createdAt: { $gte: last7days, $lt: today }
    }).select("createdAt");

    const messages = new Array(7).fill(0);

    const daysInMilliseconds = 1000 * 60 * 60 * 24

    last7daysMessages.forEach(message => {
        const indexApprox = (today.getTime() - message.createdAt.getTime()) / daysInMilliseconds
        const dayIndex = Math.floor(indexApprox);
        messages[6 - dayIndex]++;
    });

    const stats = {
        totalUsers,
        totalChats,
        totalMessages,
        totalGroups,
        messagesChart: messages
    }
    return res.status(200).json({
        success: true,
        stats
    })
})

export {
    allUsers,
    allChats,
    allMessages,
    getDashboardStats,
}