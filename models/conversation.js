const mongoose = require('mongoose');

// 1. Define the Schema
const conversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    title: {
        type: String,
        required: true,
    },

    messages: [
        {
            role: {
                type: String,
                required: true
            },
            content: {
                type: String
            }
        }
    ]
}, {
    timestamps: true
});

conversationSchema.index({
    userId: 1,
    createdAt: -1
});

// 2. Create and Export the Model
const conversation = mongoose.model('Conversation', conversationSchema);

module.exports = conversation;
