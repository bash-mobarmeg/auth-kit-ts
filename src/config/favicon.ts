// ------------------------------
// Imports
// ------------------------------
import { Request, Response } from "express";                // Express request and response types
import path from "path";                                   // Node.js module for handling file paths
import fs from "fs";                                       // Node.js filesystem module
import { RESOURCES_PATH, OK_STATUS } from "@common/constants"; // Project constants for resource directory and status codes
import { ApiErrorInternalServerError } from "@api/res/error";  // Custom 500 error class
import { logger } from "@logger";                          // Application logger instance

// ------------------------------
// Favicon Controller
// ------------------------------
// Handles requests to `/favicon.ico`.
// Streams the favicon from the resources directory to the client.
// If the file is missing or unreadable, logs the error and throws a 500 response.
export const FavIconController = (_: Request, res: Response) => {
    try {
        // Construct absolute path to favicon file
        const iconPath = path.join(RESOURCES_PATH, "favicon.ico");

        // Get file stats to include size in response headers
        const stats = fs.statSync(iconPath);

        // Set HTTP headers before sending file
        res.writeHead(OK_STATUS, {
            "Content-Type": "image/x-icon", // MIME type for .ico files
            "Content-Length": stats.size    // Helps browser know file size beforehand
        });

        // Create a readable file stream
        const readStream = fs.createReadStream(iconPath);

        // Pipe the favicon data directly to the response stream
        readStream.pipe(res);

    } catch (err) {
        // Log the error for debugging or monitoring
        logger.error(err);

        // Throw a standardized 500 Internal Server Error response
        throw new ApiErrorInternalServerError({});
    }
};

