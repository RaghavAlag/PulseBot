const express = require('express');
const router = express.Router();
const User = require("../models/user")
const handleaskingAI = require("../controllers/askingai")
const getConversations = require("../controllers/conversation")
const deleteConversation = require("../controllers/deleteconversation")
const renameconversation = require("../controllers/renameconversation")
const showchat = require("../controllers/showchat")
const rateLimit = require("express-rate-limit");

const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        error: "Too many AI requests. Please try again later."
    }
});

// define the askingAI page route
router.post('/askingai', aiLimiter , handleaskingAI);

// define the delete route
router.post('/conversation/delete/:id', deleteConversation);

// define the rename route
router.post('/conversation/rename/:id', renameconversation);

// define the show chat route
router.get('/conversation/:id', showchat);

// define the conversation page route
router.get('/conversation', getConversations);

// define the default page route
router.get("/", (req, res) => {
    res.render("chat");
});

module.exports = router;