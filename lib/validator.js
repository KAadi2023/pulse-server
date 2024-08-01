import { body, validationResult, check, param } from 'express-validator';
import { ErrorHandler } from '../utils/utility.js';

const validateHandler = (req, res, next) => {
    const errors = validationResult(req);

    const errorMessages = errors.array().map((error) => error.msg).join(', ');

    if (!errors.isEmpty()) {
        return next(new ErrorHandler(errorMessages, 400))
    }
    next();
}

const registerValidator = () => [
    body("name", "Please Enter Name").notEmpty(),
    body("username", "Please Enter Username").notEmpty(),
    body("bio", "Please Enter bio").notEmpty(),
    body("password", "Please Enter Password").notEmpty()
];

const loginValidator = () => [
    body("username", "Please Enter Username").notEmpty(),
    body("password", "Please Enter Password").notEmpty(),
];

const newGroupChatValidator = () => [
    body("name", "Please Enter group name").notEmpty(),
    body("members").notEmpty().withMessage("Please Enter members").isArray({
        min: 2,
        max: 100
    }).withMessage("Members must be 2-100"),
];

const addMembersValidator = () => [
    body("chatId", "Please Enter Chat Id").notEmpty(),
    body("members").notEmpty().withMessage("Please Enter members").isArray({
        min: 1,
        max: 97
    }).withMessage("Members must be 1-97"),
]

const removeMemberValidator = () => [
    body("chatId", "Please Enter Chat Id").notEmpty(),
    body("userId", "Please Enter User Id").notEmpty(),
]

const leaveGroupValidator = () => [
    param("id", "Please Enter Chat Id").notEmpty()
]

const sendAttachmentsValidator = () => [
    body("chatId", "Please Enter Chat Id").notEmpty(),
    // check("files").notEmpty().withMessage("Please upload Attachments").isArray({
    //     min: 1,
    //     max: 5
    // }).withMessage("Files must be 1-5"),
]

const chatIdValidator = () => [
    param("id", "Please Enter Chat Id").notEmpty(),
]

const renameGroupValidator = () => [
    param("id", "Please Enter Chat Id").notEmpty(),
    body("name", "Please Enter New Group Name").notEmpty(),
]

const sendFriendRequestValidator = () => [
    body("userId", "Please Enter user id").notEmpty(),
]

const AcceptFriendRequestValidator = () => [
    body("requestId", "Please Enter Request Id").notEmpty(),
    body("accept").
        notEmpty().withMessage("Please choose accept or reject").
        isBoolean().
        withMessage("Accept must be a boolean"),
]

const adminLoginValidator = () => [
    body("secretKey", "Please enter your secret key").notEmpty(),
]

export {
    validateHandler,
    registerValidator,
    loginValidator,
    newGroupChatValidator,
    addMembersValidator,
    removeMemberValidator,
    leaveGroupValidator,
    sendAttachmentsValidator,
    chatIdValidator,
    renameGroupValidator,
    sendFriendRequestValidator,
    AcceptFriendRequestValidator,
    adminLoginValidator
}