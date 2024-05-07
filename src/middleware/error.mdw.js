export const errorMdw = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;
    err.errors = err.errors || "Invalid Input";

    return res.status(err.statusCode).json({
        success: false,
        // from: "middleware",
        message: err.message,
        errors: err.errors,
    });
};
