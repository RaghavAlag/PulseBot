const express = require('express');
const router = express.Router();
const { handleCreatingUser , handleLoginUser} = require("../controllers/user")

//Create entry in database for each new user
router.post('/signUp', handleCreatingUser);
router.post('/login', handleLoginUser);

module.exports = router;