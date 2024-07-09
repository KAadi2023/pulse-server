import express from 'express';
import userRoute from  './routes/user.js'

const app = express();

// home routes
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// user routes
app.use("/user", userRoute);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});