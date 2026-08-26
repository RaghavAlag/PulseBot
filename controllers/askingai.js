const User = require("../models/user")
const chatWithAI = require("../ai/chat")
const Conversation = require("../models/conversation");
const { redisDelPattern } = require("../utils/safeRedis");

async function handleaskingAI(req, res) {
    try {
        const message = req.body.message;
        if (!message || message.trim() === "") {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        if (message.length > 2000) {
            return res.status(400).json({
                error: "Message is too long"
            });
        }
        const currentConversationId = req.body.conversationId;
        const userId = req.userId;
        let chat
        let data

        if (currentConversationId == null) {

            // SSE start
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            res.flushHeaders();

            data = await chatWithAI([], message, (chunk) => {
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            });

            chat = await Conversation.create({
                userId: userId,
                title: message,
                messages: [
                    { role: "user", content: message },
                    { role: "assistant", content: data }
                ]
            });

            await redisDelPattern(`conversations:${userId}:*`);

        } else {

            chat = await Conversation.findOne({
                _id: currentConversationId,
                userId: req.userId
            });

            if (!chat) {
                return res.status(403).json({
                    error: "You are not allowed to access this conversation"
                });
            }

            // Ab ownership verify ho gayi → SSE start
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            res.flushHeaders();

            const previousMessages = chat.messages;

            data = await chatWithAI(previousMessages, message, (chunk) => {
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            });

            chat.messages.push({
                role: "user",
                content: message
            });

            chat.messages.push({
                role: "assistant",
                content: data
            });

            await chat.save();

            await redisDelPattern(`conversations:${userId}:*`);
        }

        res.write(`data: ${JSON.stringify({
            done: true,
            conversationId: chat._id
        })}\n\n`);

        res.end();
    } catch (error) {
        console.error("Asking AI Error:", error);
        if (res.headersSent) {
            res.write(`event: error\n`);
            res.write(`data: ${JSON.stringify({
                error: "Something went wrong while processing your message"
            })}\n\n`);

            res.end();
        } else {
            return res.status(500).json({
                error: "Something went wrong while processing your message"
            });
        }
    }
}

module.exports = handleaskingAI