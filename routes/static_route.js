const express = require('express');
const router = express.Router();
const User = require("../models/user")
const jwt = require("jsonwebtoken")

// define the signup page route
router.get('/signup', (req, res) => {
    res.render('signup')
});

// define the login page route
router.get('/login', (req, res) => {
    res.render('login')
});

// define the home page route
router.get('/', (req, res) => {
    res.render('landingpage')
});

module.exports = router;