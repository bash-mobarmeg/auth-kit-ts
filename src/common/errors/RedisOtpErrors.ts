
export class RedisOtpError extends Error {
    public code?: string;
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

export class OtpCodeExistsError extends RedisOtpError {
    constructor(message = "Code already exits", details?: Record<string, unknown>) {
        super(message, "CODE_EXISTS_ERROR", details);
    }
}

