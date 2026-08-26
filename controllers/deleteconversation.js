const conversation = require("../models/conversation");
const { redisDelPattern } = require("../utils/safeRedis");

async function deleteConversation(req, res) {
    const userId = req.userId;

    const conversationId = req.params.id;

    const response = await conversation.findOneAndDelete({
        _id: conversationId,
        userId: req.userId
    });
    if (!response) {
        return res.status(404).json({
            error: "Conversation not found"
        });
    }
    await redisDelPattern(`conversations:${userId}:*`);
    return res.json({
        message: "Conversation deleted"
    });
}

module.exports = deleteConversation;