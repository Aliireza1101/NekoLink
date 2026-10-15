class AppError extends Error {
    public isOperational: boolean;
    public status: string;
    constructor(
        public message: string,
        public statusCode: number,
    ) {
        super(message);
        this.isOperational = true;
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
