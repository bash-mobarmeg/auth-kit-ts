import { ApiError } from './ApiError';
import HttpError from './constants/http-error.json';

export class ApiErrorConflict extends ApiError {
    static Config = HttpError[409];

    constructor({ message, errorCode, cause, payload, details }: ApiErrorConflictConstructor) {
        super({
            code: 409,
            message: message || ApiErrorConflict.Config.message,
            errorCode,
            errorType: ApiErrorConflict.Config.type,
            cause,
            payload,
            details
        });
    }

    static assert({ condition, message, errorCode, cause, payload }: AssertInput): void {
        if (!condition) {
            throw new this({
                message,
                errorCode,
                cause,
                payload
            });
        }
    }
}

interface ApiErrorConflictConstructor {
    message?: string;
    errorCode?: string;
    cause?: Error;
    payload?: any;
    details?: any;
}

interface AssertInput extends ApiErrorConflictConstructor {
    condition: boolean;
}
