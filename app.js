import express from 'express';
import userRoute from './routes/user.js'
import { connectToDB } from './utils/common.js';
import dotenv from 'dotenv'
import { errorMiddleware } from './middlewares/error.js';
import cookieParser from 'cookie-parser';

dotenv.config({
    path: './.env'
})

const MONGODB_URI = process.env.MONGODB_URI;
const port = process.env.PORT || 3000

connectToDB(MONGODB_URI)

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

app.use(errorMiddleware);

app.listen(port, () => {
    console.log('Server is running on port 3000');
});