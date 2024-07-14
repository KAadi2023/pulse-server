import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import { attachmentsMulter } from '../middlewares/multer.js';
import {
    addMembers,
    deleteChat,
    getChatDetails,
    getMessages,
    getMyChats,
    getMyGroups,
    leaveGroup,
    newGroupChat,
    removeMember,
    renameGroup,
    sendAttachments
} from '../controllers/chat.js';

import {
    addMembersValidator,
    chatIdValidator,
    newGroupChatValidator,
    removeMemberValidator,
    sendAttachmentsValidator,
    renameGroupValidator,
    validateHandler
} from '../lib/validator.js';

const app = express.Router();

app.use(isAuthenticated);

app.post("/new", newGroupChatValidator(), validateHandler, newGroupChat)
app.get("/my", getMyChats)
app.get("/my/groups", getMyGroups)
app.put("/add-members", addMembersValidator(), validateHandler, addMembers)
app.put("/remove-member", removeMemberValidator(), validateHandler, removeMember)
app.delete("/leave/:id", chatIdValidator(), validateHandler, leaveGroup)

app.post("/message", attachmentsMulter, sendAttachmentsValidator(), validateHandler, sendAttachments)

// get messages
app.get("/messages/:id", chatIdValidator(), validateHandler, getMessages);

// Get Chat Details Rename, Delete
app.route("/:id").
    get(chatIdValidator(), validateHandler, getChatDetails).
    put(renameGroupValidator(), validateHandler, renameGroup).
    delete(chatIdValidator(), validateHandler, deleteChat)

export default app;

