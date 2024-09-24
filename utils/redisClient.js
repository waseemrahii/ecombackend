// utils/redisClient.js
import redis from "redis";

const client = redis.createClient({
	url: `redis://localhost:6379`,
});

client.on("error", (err) => {
	console.error("Redis error:", err);
});

client.on("connect", () => {
	console.log("Connected to Redis");
});

client.on("ready", () => {
	console.log("Redis client is ready");
});

client.on("end", () => {
	console.log("Redis client connection closed");
});

// Connect to Redis
const connectToRedis = async () => {
	try {
		await client.connect();
	} catch (error) {
		console.error("Failed to connect to Redis:", error);
	}
};

connectToRedis();

// Graceful shutdown
const shutdown = async () => {
	try {
		await client.quit();
	} catch (error) {
		console.error("Error during Redis shutdown:", error);
	}
};

// Export client and shutdown function
export { client, shutdown };
