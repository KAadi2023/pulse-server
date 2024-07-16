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

const allMessages = TryCatch(async (req, res) => { });

export {
    allUsers,
    allChats,
    allMessages,
}