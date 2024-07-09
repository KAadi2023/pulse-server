import express from 'express';
import { login } from '../controllers/user.js';

const app = express.Router();

// Define routes
app.get("/login", login)

export default app;

