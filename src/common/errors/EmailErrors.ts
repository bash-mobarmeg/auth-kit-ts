
export class EmailError extends Error {
    public code: string;
    public details?: Record<string, unknown>;

    constructor(message: string, code: string, details?: Record<string, unknown>) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.details = details;

        // Ensure instanceof works correctly
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class EmailNotAcceptedError extends EmailError {
    constructor(message = "Email address not accepted", details?: Record<string, unknown>) {
        super(message, "EMAIL_NOT_ACCEPTED_ERROR", details);
    }
}

export class EmailSendError extends EmailError {
    constructor(message = "Email send error", details?: Record<string, unknown>) {
        super(message, "EMAIL_SEND_ERROR", details);
    }
}

