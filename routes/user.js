import express from 'express';
import { login, register } from '../controllers/user.js';
import { singleAvatar } from '../middlewares/multer.js';

const app = express.Router();

// Define routes
app.post("/register", singleAvatar, register);
app.post("/login", login)

export default app;

