import express from 'express';
import { connectToDB } from './utils/common.js';
import dotenv from 'dotenv'
import { errorMiddleware } from './middlewares/error.js';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import { createServer } from 'http'
import { v4 as uuid } from 'uuid'
import cors from 'cors'

import userRoute from './routes/user.js'
import chatRoute from './routes/chat.js'
import adminRoute from './routes/admin.js'
import { createMessagesInAGroup } from './seeders/chat.js';
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from './constants/events.js';
import { getSockets } from './lib/helper.js';
import { Message } from './models/message.js';

dotenv.config({
    path: './.env'
})

const MONGODB_URI = process.env.MONGODB_URI;
const port = process.env.PORT || 3000;
const envMode = process.env.NODE_ENV.trim() || "PRODUCTION"

const adminSecretKey = process.env.ADMIN_SECRET_KEY;

const userSocketIds = new Map();

connectToDB(MONGODB_URI);

// createMessagesInAGroup("669372d0aa009d987e945dd6", 50);

const app = express();
const server = createServer(app);
const io = new Server(server, {});

// using middleware here

app.use(express.json());
app.use(cookieParser());
app.use(cors());

// home routes
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// user routes
app.use("/user", userRoute);
app.use("/chat", chatRoute);
app.use("/admin", adminRoute);

io.use((socket, next) => { })

io.on('connection', (socket) => {
    const user = {
        _id: 'shfshfsg',
        name: 'Aditya Kumar'
    }

    userSocketIds.set(user._id.toString(), socket.id);

    console.log(userSocketIds);

    socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
        const messageForRealTime = {
            content: message,
            _id: uuid(),
            sender: {
                _id: user._id,
                name: user.name
            },
            chat: chatId,
            createdAt: new Date().toISOString()
        }

        const messageForDB = {
            content: message,
            sender: user._id,
            chat: chatId
        }

        const membersSocket = getSockets(members);
        io.to(membersSocket).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime
        });
        io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId })

        try {
            await Message.create(messageForDB)
        } catch (error) {
            console.log(error)
        }
    })

    socket.on('disconnect', () => {
        console.log(`user disconnected: ${socket.id}`);
        userSocketIds.delete(user._id.toString());
    });
});

app.use(errorMiddleware);

server.listen(port, () => {
    console.log(`Server is running on port ${port} in ${envMode} mode`);
});

export {
    adminSecretKey,
    envMode,
    userSocketIds
}