import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from "./error.js";
import jwt from 'jsonwebtoken';

const isAuthenticated = (req, res, next) => {
    const token = req.cookies["pulse-token"]

    if (!token) return next(new ErrorHandler("Please Login to access this route", 401));

    // Verify JWT token here
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decodedData._id;

    next();

}

export { isAuthenticated }