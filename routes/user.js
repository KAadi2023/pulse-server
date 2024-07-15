import express from 'express';
import { getMyProfile, login, logout, register, searchUser, sendFriendRequest } from '../controllers/user.js';
import { singleAvatar } from '../middlewares/multer.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { loginValidator, registerValidator, sendFriendRequestValidator, validateHandler } from '../lib/validator.js';

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

export default app;

