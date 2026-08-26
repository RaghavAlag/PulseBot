const redisClient = require("../redis");

async function redisGet(key) {
    try {
        if (!redisClient.isReady) {
            return null;
        }

        return await redisClient.get(key);
    } catch (error) {
        console.error("Redis GET failed:", error.message);
        return null;
    }
}

async function redisSet(key, value, options) {
    try {
        if (!redisClient.isReady) {
            return;
        }

        await redisClient.set(key, value, options);
    } catch (error) {
        console.error("Redis SET failed:", error.message);
    }
}

async function redisDel(key) {
    try {
        if (!redisClient.isReady) {
            return;
        }

        await redisClient.del(key);
    } catch (error) {
        console.error("Redis DEL failed:", error.message);
    }
}
async function redisDelPattern(pattern) {
    try {
        if (!redisClient.isReady) {
            return;
        }

        const keys = [];

        for await (const key of redisClient.scanIterator({
            MATCH: pattern,
            COUNT: 100
        })) {
            keys.push(key);
        }

        for (const key of keys) {
            await redisClient.del(key);
        }

        console.log(`Redis pattern deleted: ${pattern}`);

    } catch (error) {
        console.error(
            "Redis DEL PATTERN failed:",
            error.message
        );
    }
}
module.exports = {
    redisGet,
    redisSet,
    redisDel,
    redisDelPattern
};