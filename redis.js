const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on("error", (error) => {
    console.error("Redis Error:", error.message);
});

async function connectRedis() {
    try {
        await redisClient.connect();
        console.log("Redis Connected");
    } catch (error) {
        console.error("Redis Connection Failed:", error.message);
    }
}

connectRedis();

module.exports = redisClient;