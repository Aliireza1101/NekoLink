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

export class NotFound extends AppError {
    constructor(name: string | undefined = undefined) {
        if (name) {
            super(`${name} not found`, 404);
        } else {
            super("Not found", 404);
        }
        this.name = "NotFound";
    }
}

export class PlanUnavailable extends Error {
    constructor(public identifier: any) {
        super(`User ${identifier} does not have a plan`);
    }
}

export default AppError;
