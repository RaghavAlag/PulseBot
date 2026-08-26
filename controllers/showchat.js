const Conversation = require("../models/conversation");

async function showchat(req, res) {
    try {
        const id = req.params.id;

        const response = await Conversation.findOne({
            _id: id,
            userId: req.userId
        });

        if (!response) {
            return res.status(404).json({
                error: "Conversation not found"
            });
        }

        return res.json(response);

    } catch (error) {
        console.error("Show chat error:", error);

        return res.status(400).json({
            error: "Invalid conversation ID"
        });
    }
}

module.exports = showchat;