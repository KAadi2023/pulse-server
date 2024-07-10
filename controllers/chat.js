import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";
import { Chat } from "../models/chat.js"
import { emitEvent } from "../utils/common.js";
import { ALERT, REFETCH_CHATS } from "../constants/events.js";
import { getOtherMember } from "../lib/helper.js";
import { User } from "../models/user.js";

const newGroupChat = TryCatch(async (req, res, next) => {
    // Your code to create a new group chat goes here
    const { name, members } = req.body;

    if (members.length < 2)
        return next(new ErrorHandler("Group Chat Must have at least 3 members", 400))

    const allMenmbers = [...members, req.userId];
    await Chat.create({
        name,
        groupChat: true,
        members: allMenmbers,
        creator: req.userId
    })

    emitEvent(req, ALERT, allMenmbers, `Welcome to ${name} group`)
    emitEvent(req, REFETCH_CHATS, members, `Welcome to ${name} group`)

    return res.status(201).json({
        success: true,
        message: "Group created successfully",
    });
});

const getMyChats = TryCatch(async (req, res, next) => {

    const chats = await Chat.find({ members: req.userId }).populate(
        "members",
        "name avatar"
    );

    // transform chat
    const transformedChats = chats.map(({ _id, name, members, groupChat }) => {

        const otherMember = getOtherMember(members, req.userId)

        return {
            _id,
            name: groupChat ? name : otherMember.name,
            groupChat,
            avatar: groupChat ? members.slice(0, 3).map(({ avatar }) => avatar.url) : [otherMember.avatar.url],
            members: members.reduce((prev, curr) => {
                if (curr._id.toString() !== req.userId.toString()) {
                    prev.push(curr._id);
                }
                return prev;
            }, [])
        }
    });


    return res.status(200).json({
        success: true,
        chats: transformedChats
    });
});

const getMyGroups = TryCatch(async (req, res, next) => {
    const chats = await Chat.find({
        members: req.userId,
        groupChat: true,
        creator: req.userId
    }).populate(
        "members",
        "name avatar"
    );

    const groups = chats.map(({ members, _id, groupChat, name }) => ({
        _id,
        groupChat,
        name,
        avatar: members.slice(0, 3).map(({ avatar }) => avatar.url)
    }))

    return res.status(200).json({
        success: true,
        groups
    });
})

const addMembers = TryCatch(async (req, res, next) => {

    const { chatId, members } = req.body;
    if (!chatId) return next(new ErrorHandler("chatId is required", 400));
    if (!members.length) return next(new ErrorHandler("members are required", 400));

    const chat = await Chat.findById(chatId);

    if (!chat) return next(new ErrorHandler("this is not a group chat", 404));

    if (!chat.groupChat) return next(new ErrorHandler("Chat not found", 404));

    if (chat.creator.toString() !== req.userId.toString()) return next(new ErrorHandler("You are not allowed to add members", 403));

    const allNewMembersPromise = members.map((i) => User.findById(i, "name"));

    const allNewMembers = await Promise.all(allNewMembersPromise);

    const uniqueMembers = allNewMembers.filter(
        (member) => !chat.members.includes(member._id.toString())
    ).map((i) => i._id)

    chat.members.push(...uniqueMembers);

    if (chat.members.length > 100)
        return next(new ErrorHandler("Group members limit reached", 400));

    await chat.save();

    const allUsersName = allNewMembers.map((i) => i.name).join(",");
    emitEvent(req, ALERT, chat.members, `${allUsersName} joined the group`);
    emitEvent(req, REFETCH_CHATS, chat.members);

    return res.status(200).json({
        success: true,
        message: "members added successfully"
    });
})

const removeMember = TryCatch(async (req, res, next) => {
    const { userId, chatId } = req.body;

    if (!userId || !chatId) return next(new ErrorHandler("userId and chatId are required", 400));

    const [chat, userThatWillBeRemoved] = await Promise.all([
        Chat.findById(chatId),
        User.findById(userId, "name")
    ])

    if (!chat) return next(new ErrorHandler("this is not a group chat", 404));

    if (!chat.groupChat) return next(new ErrorHandler("Chat not found", 404));

    if (chat.creator.toString() !== req.userId.toString()) return next(new ErrorHandler("You are not allowed to remove members", 403));

    chat.members = chat.members.filter(
        (memberId) => memberId.toString() !== userId.toString()
    )

    await chat.save();

    emitEvent(req, ALERT, chat.members, `${userThatWillBeRemoved.name} has been removed from the group`);

    emitEvent(req, REFETCH_CHATS, chat.members);

    return res.status(200).json({
        success: true,
        message: "member removed successfully"
    });
})


export { newGroupChat, getMyChats, getMyGroups, addMembers, removeMember }