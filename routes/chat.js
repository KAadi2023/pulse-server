import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import { addMembers, getMyChats, getMyGroups, newGroupChat, removeMember } from '../controllers/chat.js';

const app = express.Router();

app.use(isAuthenticated);

app.post("/new", newGroupChat)
app.get("/my", getMyChats)
app.get("/my/groups", getMyGroups)
app.put("/add-members", addMembers)
app.put("/remove-member", removeMember)

export default app;

