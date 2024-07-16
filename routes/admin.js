import express from 'express';
import { adminLoginValidator, validateHandler } from '../lib/validator.js';
import { adminOnly } from '../middlewares/auth.js';
import {
    adminLogin,
    adminLogout,
    allChats,
    allMessages,
    allUsers,
    getAdminData,
    getDashboardStats
} from '../controllers/admin.js';

const app = express.Router();


app.post("/verify", adminLoginValidator(), validateHandler, adminLogin);

app.get("/logout", adminLogout);

// only Admin can access these routes

app.use(adminOnly)

app.get('/', getAdminData);

app.get("/users", allUsers);

app.get("/chats", allChats);

app.get("/messages", allMessages);

app.get("/stats", getDashboardStats);



export default app;