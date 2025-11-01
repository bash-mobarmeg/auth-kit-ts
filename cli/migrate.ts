// ------------------------------
// Imports
// ------------------------------
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mysql, { ResultSetHeader } from "mysql2";

// Load environment variables (DB credentials, etc.)
dotenv.config({ quiet: true, debug: false });

// ------------------------------
// Migration Runner (IIFE)
// ------------------------------
// This script automatically executes all .sql files located in the
// "migrations" directory, running each file's SQL statements in order.
// It’s designed to be run manually or as part of a deployment pipeline.
(async () => {
    try {
        // --------------------------
        // Database Connection Pool
        // --------------------------
        // Uses mysql2's Promise API for async/await compatibility.
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        }).promise();

        // --------------------------
        // Locate Migration Files
        // --------------------------
        const migrationsDir = path.join(__dirname, "../migrations");

        // Read all SQL files in the migrations folder
        const files = fs
            .readdirSync(migrationsDir)
            .filter(f => f.endsWith(".sql")); // only run .sql files

        // await pool.query<ResultSetHeader>("SET FOREIGN_KEY_CHECKS = 0");
        // await pool.query<ResultSetHeader>("DROP TABLE IF EXISTS tfas");
        // await pool.query<ResultSetHeader>("DROP TABLE IF EXISTS auth_providers");
        // await pool.query<ResultSetHeader>("DROP TABLE IF EXISTS users");
        // await pool.query<ResultSetHeader>("SET FOREIGN_KEY_CHECKS = 1");

        // --------------------------
        // Execute Each Migration
        // --------------------------
        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, "utf8");

            console.log(`🚀 Running migration: ${file}`);

            // Some migrations may contain multiple queries separated by semicolons.
            const queries = sql
                .split(";")
                .map(q => q.trim())
                .filter(q => q.length); // remove empty statements

            for (const query of queries) {
                await pool.query<ResultSetHeader>(query);
            }

            console.log(`✅ Migration completed: ${file}`);
        }

        // --------------------------
        // Completion
        // --------------------------
        console.log("🎉 All migrations completed successfully!");
    } catch (err) {
        // --------------------------
        // Error Handling
        // --------------------------
        console.error("❌ Migration failed:", err);
    }

    // --------------------------
    // Graceful Exit
    // --------------------------
    process.exit(0);
})();

