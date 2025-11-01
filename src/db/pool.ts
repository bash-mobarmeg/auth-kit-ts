// ------------------------------
// Imports
// ------------------------------
import mysql, { Pool, PoolConnection } from "mysql2/promise"; // MySQL client with Promise support
import { logger } from "@logger";                             // Centralized application logger
import dotenv from "dotenv";                                  // For loading environment variables

// ------------------------------
// Environment Configuration
// ------------------------------
// Loads variables from `.env` file into process.env
dotenv.config({ quiet: true, debug: false });

// ------------------------------
// MySQL Connection Pool
// ------------------------------
// Creates a pool of reusable connections for efficient DB access.
// Using a pool prevents overhead from constantly opening and closing connections.
export const SqlPool: Pool = mysql.createPool({
    host: process.env.DB_HOST,        // Database host (e.g., localhost or remote server)
    user: process.env.DB_USER,        // Database username
    password: process.env.DB_PASSWORD,// Database password
    database: process.env.DB_NAME,    // Default database name
    waitForConnections: true,         // Queue requests if all connections are busy
    connectionLimit: 10,              // Max number of concurrent connections
    queueLimit: 0,                    // No limit on queued connection requests
});

// ------------------------------
// Connection Test (Self-Check)
// ------------------------------
// Immediately attempts to establish a connection at startup.
// Useful for validating environment variables and DB connectivity.
(async () => {
    try {
        const connection: PoolConnection = await SqlPool.getConnection(); // Attempt connection
        logger.info("✅ Database connected!");                            // Log success
        connection.release();                                             // Release connection back to pool
    } catch (err) {
        // Log connection error with details
        logger.error("❌ pool.getConnection error:", err);
    }
})();

