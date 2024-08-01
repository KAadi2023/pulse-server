import { envMode } from "../app.js";

const errorMiddleware = (err, req, res, next) => {
    err.message ||= "Internal Server Error";
    err.statusCode ||= 500;

    if (err.code === 11000) {
        const error = Object.keys(err.keyPattern).join(',');
        err.statusCode = 400;
        err.message = `Duplicate Field - ${error}`
    }

    if (err.name === "CastError") {
        const errPath = err.path;
        const message = `Invalid Format of - ${errPath}`;
        err.statusCode = 400;
        err.message = message;
    }
    return res.status(err.statusCode).json({
        success: false,
        message: envMode === 'DEVELOPMENT' ? err : err.message
    });
}

const TryCatch = (passedFunc) => async (req, res, next) => {
    try {
        await passedFunc(req, res, next);
    } catch (error) {
        next(error);
    }
}

export { errorMiddleware, TryCatch }