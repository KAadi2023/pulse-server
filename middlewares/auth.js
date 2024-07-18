import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from "./error.js";
import jwt from 'jsonwebtoken';
import { adminSecretKey } from '../app.js'

const isAuthenticated = (req, res, next) => {
    const token = req.cookies["pulse-token"]

    if (!token) return next(new ErrorHandler("Please Login to access this route", 401));

    // Verify JWT token here
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decodedData._id;

    next();

}

const adminOnly = (req, res, next) => {
    const token = req.cookies["pulse-admin-token"]

    console.log("token from admin auth", token)

    if (!token) return next(new ErrorHandler("Only Admin can access this routes", 401));

    // Verify JWT token here
    const secretKey = jwt.verify(token, process.env.JWT_SECRET);

    console.log("secretkey from admin auth", secretKey)

    if (secretKey !== adminSecretKey) {
        return next(new ErrorHandler("Invalid Admin secret key", 401));
    }

    next();

}

export { isAuthenticated, adminOnly }