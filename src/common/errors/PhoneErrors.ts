
export class PhoneError extends Error {
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

export class PhoneSendError extends PhoneError {
    constructor(message = "Phone number send error", details?: Record<string, unknown>) {
        super(message, "PHONE_SEND_ERROR", details);
    }
}

