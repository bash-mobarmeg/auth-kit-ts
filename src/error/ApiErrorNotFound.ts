import { ApiError } from './ApiError';
import HttpError from './constants/http-error.json';

export class ApiErrorNotFound extends ApiError {
    static Config = HttpError[404];

    constructor({ message, errorCode, cause, payload, details }: ApiErrorNotFoundConstructor) {
        super({
            code: 404,
            message: message || ApiErrorNotFound.Config.message,
            errorCode,
            errorType: ApiErrorNotFound.Config.type,
            cause,
            payload,
            details
        });
    }

    static assert({
        condition,
        message,
        errorCode,
        cause,
        payload
    }: AssertInput): void {
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

interface ApiErrorNotFoundConstructor {
    message?: string;
    errorCode?: string;
    cause?: Error;
    payload?: any;
    details?: any;
}

interface AssertInput extends ApiErrorNotFoundConstructor {
    condition: boolean;
}
