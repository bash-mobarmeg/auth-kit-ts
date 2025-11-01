// ------------------------------
// Imports
// ------------------------------
import { RequestHandler } from "express";               // Express type for middleware
import { ApiErrorNotFound } from "@api/res/error";      // Custom 404 error response class

// ------------------------------
// Invalid URL Handler
// ------------------------------
// This middleware handles all requests that don’t match any defined route.
// It throws a standardized 404 error using the custom `ApiErrorNotFound` class.
// The global error handler (ErrorHandler) will catch and format this response.
export const invalidUrlHandler: RequestHandler = () => {
    throw new ApiErrorNotFound({
        message: "Invalid URL — please check the endpoint and try again."
    });
};

