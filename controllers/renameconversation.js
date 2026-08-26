const conversation = require("../models/conversation");
const { redisDelPattern } = require("../utils/safeRedis");


async function renameConversation(req, res) {
    const userId = req.userId;

    const id = req.params.id;
    const title = req.body.title;
    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            error: "Invalid title"
        });
    }

    if (title.length > 100) {
        return res.status(400).json({
            error: "Title is too long"
        });
    }
    const response = await conversation.findOneAndUpdate(
        {
            _id: id,
            userId: req.userId
        },
        {
            title: title
        },
        {
            returnDocument: "after"
        }
    );
    if (!response) {
        return res.status(404).json({
            error: "Conversation not found"
        });
    }
    await redisDelPattern(`conversations:${userId}:*`);

    return res.json(response);
}

module.exports = renameConversation;