import { client } from './redisClient.js';
import logger from './logger.js'; // Replace console with a logger for better control


export const getCache = async (key) => {
    try {
        const cachedData = await client.get(key);
        if (cachedData) {
            logger.info(`Cache hit for key: ${key}`);
            return JSON.parse(cachedData);
        } else {
            logger.info(`Cache miss for key: ${key}`);
            return null;
        }
    } catch (error) {
        logger.error(`Error getting cache for key ${key}: ${error.message}`);
        return null; // Fail gracefully, return null if there's an issue
    }
};


export const setCache = async (key, data, expiration = 3600) => {
    try {
        await client.set(key, JSON.stringify(data), 'EX', expiration);
        logger.info(`Cache set for key: ${key}`);
    } catch (error) {
        logger.error(`Error setting cache for key ${key}: ${error.message}`);
    }
};


export const deleteCache = async (key) => {
    try {
        await client.del(key);
        logger.info(`Cache deleted for key: ${key}`);
    } catch (error) {
        logger.error(`Error deleting cache for key ${key}: ${error.message}`);
    }
};


export const invalidateCacheByPattern = async (pattern) => {
    try {
        const keys = await new Promise((resolve, reject) => {
            client.keys(pattern, (err, keys) => {
                if (err) return reject(err);
                resolve(keys);
            });
        });

        if (keys.length > 0) {
            // Delete all matching keys
            await new Promise((resolve, reject) => {
                client.del(keys, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
            logger.info(`Cache invalidated for pattern: ${pattern}`);
        } else {
            logger.info(`No cache keys found for pattern: ${pattern}`);
        }
    } catch (error) {
        logger.error(`Error invalidating cache by pattern ${pattern}: ${error.message}`);
    }
};
