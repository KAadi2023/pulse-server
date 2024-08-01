import express from 'express';
import { connectToDB } from './utils/common.js';
import dotenv from 'dotenv'
import { errorMiddleware } from './middlewares/error.js';
import cookieParser from 'cookie-parser';

import userRoute from './routes/user.js'
import chatRoute from './routes/chat.js'
import adminRoute from './routes/admin.js'
import { createMessagesInAGroup } from './seeders/chat.js';

dotenv.config({
    path: './.env'
})

const MONGODB_URI = process.env.MONGODB_URI;
const port = process.env.PORT || 3000;
const envMode = process.env.NODE_ENV.trim() || "PRODUCTION"

const adminSecretKey = process.env.ADMIN_SECRET_KEY;

connectToDB(MONGODB_URI);

// createMessagesInAGroup("669372d0aa009d987e945dd6", 50);

const app = express();

// using middleware here

app.use(express.json());
app.use(cookieParser());

// home routes
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// user routes
app.use("/user", userRoute);
app.use("/chat", chatRoute);
app.use("/admin", adminRoute);

app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`Server is running on port ${port} in ${envMode}mode`);
});

export {
    adminSecretKey,
    envMode
}