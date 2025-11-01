import http from "http";
import app from "./app";
import { logger } from "@logger";

import "source-map-support/register";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = process.env.HOST || "0.0.0.0";

export const server = http.createServer(app);


// Handle startup
server.listen(PORT, HOST, () => {
    logger.info(`🚀 Server running at http://${HOST}:${PORT}`);
});


// Graceful shutdown
const shutdown = (signal: string) => {
    logger.info(`\n${signal} received: closing server...`);
    server.close(err => {
        if (err) {
            logger.error("❌ Error closing server:", err);
            process.exit(1);
        }
        logger.info("✅ Server closed gracefully.");
        process.exit(0);
    });
};

// Catch kill signals (Docker, PM2, systemd, etc.)
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Handle uncaught errors
process.on("uncaughtException", err => {
    logger.error("❌ Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", reason => {
    logger.error("❌ Unhandled Rejection:", reason);
});

