const conversation = require("../models/conversation");
const { redisGet, redisSet } = require("../utils/safeRedis");

async function getConversations(req, res) {
    try {
        const userId = req.userId;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const skip = (page - 1) * limit;

        const key = `conversations:${userId}:page:${page}:limit:${limit}`;

        const cachedConversations = await redisGet(key);

        if (cachedConversations) {
            console.log("Data found in Redis");

            return res.json(JSON.parse(cachedConversations));
        }

        const conversations = await conversation.find({
            userId: userId
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const totalConversations = await conversation.countDocuments({
            userId: userId
        });

        const response = {
            conversations,
            pagination: {
                page,
                limit,
                total: totalConversations,
                hasMore: skip + conversations.length < totalConversations
            }
        };

        await redisSet(
            key,
            JSON.stringify(response),
            {
                EX: 300
            }
        );

        return res.json(response);

    } catch (error) {
        console.error("Get Conversations Error:", error);

        return res.status(500).json({
            error: "Something went wrong while fetching conversations"
        });
    }
}

module.exports = getConversations;