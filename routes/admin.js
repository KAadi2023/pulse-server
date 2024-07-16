import express from 'express';
import { allChats, allMessages, allUsers } from '../controllers/admin.js';

const app = express.Router();

app.get('/', (req, res) => {
    res.send('Welcome to Admin API!');
});

app.post("/verify");

app.get("/logout");

app.get("/users", allUsers);

app.get("/chats", allChats);

app.get("/messages", allMessages);

app.get("/stats");



export default app;