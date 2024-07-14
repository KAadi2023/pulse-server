import mongoose from "mongoose";
import jwt from 'jsonwebtoken';

const cookieOptions = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "none"
}

const connectToDB = (uri) => {
    mongoose.connect(uri, { dbName: 'pulse-server' })
        .then((data) => console.log(`Connected to DB: ${data.connection.host}`))
        .catch((err) => console.error(`Error connecting to DB: ${err}`));
}

const sendToken = (res, user, code, message) => {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)

    return res.status(code).cookie("pulse-token", token, cookieOptions).json({
        success: true,
        message
    })
}


const emitEvent = (req, event, users, data) => {
    console.log("Emmiting event: ", event)
}

const deleteFilesFromCloudinary = async (public_ids) => {
    // delete files from cloudinary
}


export { connectToDB, sendToken, cookieOptions, emitEvent, deleteFilesFromCloudinary }