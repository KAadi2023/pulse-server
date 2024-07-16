import express from 'express';
import { singleAvatar } from '../middlewares/multer.js';
import { isAuthenticated } from '../middlewares/auth.js';
import {
    login,
    logout,
    register,
    searchUser,
    getMyProfile,
    sendFriendRequest,
    getMyNotifications,
    acceptFriendRequest,
} from '../controllers/user.js';
import {
    loginValidator,
    validateHandler,
    registerValidator,
    sendFriendRequestValidator,
    AcceptFriendRequestValidator,
} from '../lib/validator.js';

const app = express.Router();

// Define routes
app.post("/register", singleAvatar, registerValidator(), validateHandler, register);
app.post("/login", loginValidator(), validateHandler, login)

app.use(isAuthenticated);
// after here user must be logged in
app.get("/me", getMyProfile);

app.get("/logout", logout);
app.get("/search", searchUser);
app.put("/send-req", sendFriendRequestValidator(), validateHandler, sendFriendRequest);
app.put("/accept-req", AcceptFriendRequestValidator(), validateHandler, acceptFriendRequest);
app.get("/notifications", getMyNotifications);

export default app;

