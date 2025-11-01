import Redis from "ioredis";

// Create a Redis client instance
// This client connects to a single Redis server using a custom ACL user
export const redisClient = new Redis({
    host: '127.0.0.1',        // Redis server host (local machine)
    port: 6379,               // Redis server port (default 6379)
    username: 'user',         // ACL username created in Redis 6+
    password: 'password1',    // Password for the ACL user
    enableReadyCheck: false   // Disable ioredis "ready check" to avoid running INFO command
                              // Useful if the ACL user does not have permission to run INFO
                              // INFO is normally used by ioredis to verify the server is ready
});

// Now you can use `redisClient` to run commands like GET, SET, DEL
// Example:
// await redisClient.set("key", "value");
// const value = await redisClient.get("key");

