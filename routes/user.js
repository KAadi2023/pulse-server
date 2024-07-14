import express from 'express';
import { getMyProfile, login, logout, register, searchUser } from '../controllers/user.js';
import { singleAvatar } from '../middlewares/multer.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { loginValidator, registerValidator, validateHandler } from '../lib/validator.js';

const app = express.Router();

// Define routes
app.post("/register", singleAvatar, registerValidator(), validateHandler, register);
app.post("/login", loginValidator(), validateHandler, login)

app.use(isAuthenticated);
// after here user must be logged in
app.get("/me", getMyProfile);

app.get("/logout", logout);
app.get("/search", searchUser);

export default app;

