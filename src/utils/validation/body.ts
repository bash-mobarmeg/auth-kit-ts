// ------------------------------
// Imports
// ------------------------------
import { ApiErrorBadRequest } from "src/error/ApiErrorBadRequest"; // Custom 400 Bad Request error

// ------------------------------
// validateBodyType Utility
// ------------------------------
// Validates the runtime type of an incoming request body or parameter.
// Ensures that the value matches the expected JavaScript primitive/object type.
//
// Arguments:
// - body: The value to validate (usually req.body or one of its fields)
// - type: Expected type ("string", "number", "boolean", "object")
//
// Behavior:
// - If body is null/undefined OR not of the expected type → throws ApiErrorBadRequest
// - Otherwise → validation passes silently
//
// Example:
//   validateBodyType(req.body.email, "string");
//   validateBodyType(req.body.age, "number");
export const validateBodyType = (
    body: any,
    type: "string" | "number" | "boolean" | "object"
) => {
    // Validate both presence and type
    if (!(body && typeof body === type)) {
        throw new ApiErrorBadRequest({
            message: "Invalid request body",
        });
    }
};

