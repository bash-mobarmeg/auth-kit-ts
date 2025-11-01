export class ApiError extends Error {
    code: number;
    errorType: string;
    errorCode?: string;
    cause?: Error;
    payload?: any;
    details?: any;

    constructor({ message, code, errorType, errorCode, cause, payload, details }: ApiErrorConstructor) {
        super(message);
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        Error.captureStackTrace(this, this.constructor);
        // Error status code
        this.code = code;
        // Human readable error type
        this.errorType = errorType;
        // User defined error code for that Api Error
        this.errorCode = errorCode;
        this.cause = cause;
        this.payload = payload;
        this.details = details;
    }

    toJSON() {
        return {
            error: {
                message: this.message,
                code: this.code,
                errorType: this.errorType,
                errorCode: this.errorCode,
                payload: this.payload
            }
        };
    }
}

interface ApiErrorConstructor {
    message: string;
    code: number;
    errorType: string;
    errorCode?: string;
    cause?: Error;
    payload?: any;
    details?: any;
}
