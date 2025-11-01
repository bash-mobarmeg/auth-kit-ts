// ------------------------------
// Imports
// ------------------------------
import { createLogger, format, transports } from "winston";       // Winston core logging components
import DailyRotateFile from "winston-daily-rotate-file";          // Transport for rotating log files
import path from "path";                                          // For safe cross-platform path handling
import { ROOT_PATH } from "@common/constants";                    // Root path constant for consistent file structure

// ------------------------------
// Format Helpers
// ------------------------------
const { combine, timestamp, errors, label, printf, json, colorize } = format;

// Define the path where logs will be stored
const LogsPath = path.join(ROOT_PATH, "logs");

// ------------------------------
// Log Level Configuration
// ------------------------------
// - Use environment variable LOG_LEVEL if defined
// - Default to 'info' in production
// - Default to 'debug' in development
const logLevel =
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug");

// ------------------------------
// Custom Print Format (Console)
// ------------------------------
// Defines how logs appear in the console (human-readable).
// Includes timestamp, label, level, message, stack trace, and metadata.
const prinfFormat = printf(({ level, message, label, timestamp, stack, ...meta }) => {
    const metaInfo = Object.keys(meta).length ? JSON.stringify(meta) : "";
    return `${timestamp} [${label}] ${level}: ${stack || message} ${metaInfo}`;
});

// ------------------------------
// Console Output Format
// ------------------------------
// Colorized output with timestamps and stack traces for better readability during development.
const consoleFormat = combine(
    colorize(),                                    // Adds color to log levels
    label({ label: "service" }),                   // Label to identify log source
    errors({ stack: true }),                       // Include stack trace for errors
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),  // Human-readable timestamp format
    prinfFormat                                    // Apply custom printf format
);

// ------------------------------
// File Output Format
// ------------------------------
// Structured JSON logs suitable for production and automated log parsing.
const fileFormat = combine(
    label({ label: "service" }),   // Tag logs with service label
    errors({ stack: true }),       // Capture full error stacks
    timestamp(),                   // Add ISO timestamp
    json()                         // Serialize log entries to JSON
);

// ------------------------------
// Logger Instance
// ------------------------------
// Centralized Winston logger used throughout the application.
// Includes console and rotating file transports, plus error/rejection handlers.
export const logger = createLogger({
    level: logLevel,           // Logging verbosity
    format: fileFormat,        // Default log format (used for file logs)
    transports: [
        // Console logging for immediate visibility (especially in dev)
        new transports.Console({ format: consoleFormat }),

        // Daily rotating log files (prevents large single log files)
        new DailyRotateFile({
            filename: path.join(LogsPath, "app-%DATE%.log"), // e.g., app-2025-10-09.log
            datePattern: "YYYY-MM-DD",                       // Rotate daily
            zippedArchive: true,                             // Compress old logs
            maxSize: "20m",                                  // Max file size before rotation
            maxFiles: "14d"                                  // Keep logs for 14 days
        }),
    ],

    // --------------------------
    // Exception & Rejection Handling
    // --------------------------
    // Capture unhandled exceptions and rejected promises for debugging.
    exceptionHandlers: [
        new transports.File({ filename: path.join(LogsPath, "exception.log") }),
    ],
    rejectionHandlers: [
        new transports.File({ filename: path.join(LogsPath, "rejection.log") }),
    ]
});

