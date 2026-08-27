const express = require("express");
const router = express.Router();

const {
    handleCreatingUser,
    handleLoginUser,
    handleProfile,
    handleUpdateProfile,
    handleChangePassword,
    handleDeleteAccount
} = require("../controllers/user");

const auth = require("../middleware/auth");

const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: "Too many login attempts. Please try again later."
    }
});


// Create user
router.post(
    "/signUp",
    handleCreatingUser
);


// Login
router.post(
    "/login",
    loginLimiter,
    handleLoginUser
);


// Profile page
router.get(
    "/profile",
    auth,
    handleProfile
);


// Update name
router.post(
    "/profile/update",
    auth,
    handleUpdateProfile
);


// Change password
router.post(
    "/profile/password",
    auth,
    handleChangePassword
);


// Delete account
router.post(
    "/profile/delete",
    auth,
    handleDeleteAccount
);


// Logout
router.get("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    });

    return res.redirect("/login");
});


module.exports = router;