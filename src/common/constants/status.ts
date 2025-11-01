// 2xx Success
export const OK_STATUS = 200;
export const CREATED_STATUS = 201;
export const NO_CONTENT_STATUS = 204;
export const PARTIAL_CONTENT_STATUS = 206;

// 4xx Client errors
export const BAD_REQUEST_STATUS = 400;           // invalid input
export const UNAUTHORIZED_STATUS = 401;          // auth required / invalid token
export const FORBIDDEN_STATUS = 403;             // not allowed
export const NOT_FOUND_STATUS = 404;             // resource missing
export const METHOD_NOT_ALLOWED_STATUS = 405;    // wrong HTTP method
export const CONFLICT_STATUS = 409;              // duplicate resource
export const UNPROCESSABLE_ENTITY_STATUS = 422;  // semantic validation errors
export const TOO_MANY_REQUESTS_STATUS = 429;     // too many requests

// 5xx Server errors
export const INTERNAL_SERVER_ERROR_STATUS = 500;
export const NOT_IMPLEMENTED_STATUS = 501;
export const BAD_GATEWAY_STATUS = 502;
export const SERVICE_UNAVAILABLE_STATUS = 503;
export const GATEWAY_TIMEOUT_STATUS = 504;

