const User = require("../models/user")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const secret = process.env.JWT_SECRET;
const Conversation = require("../models/conversation");

async function handleCreatingUser(req, res) {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                error: "Invalid input"
            });
        }

        if (
            name.trim() === "" ||
            email.trim() === "" ||
            password.trim() === ""
        ) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail) || normalizedEmail.includes("..") || normalizedEmail.length > 254) {
            return res.status(400).json({
                error: "Please enter a valid email address"
            });
        }

        if (
            password.length < 6 ||
            password.length > 100
        ) {
            return res.status(400).json({
                error: "Password must be between 6 and 100 characters"
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                error: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        return res.redirect("/login");

    } catch (error) {
        console.error(
            "Create User Error:",
            error
        );

        // MongoDB duplicate key protection
        if (error.code === 11000) {
            return res.status(409).json({
                error: "Email already registered"
            });
        }

        return res.status(500).json({
            error: "Something went wrong while creating your account"
        });
    }
}

async function handleLoginUser(req, res) {
    const { email, password } = req.body;
    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        email.trim() === "" ||
        password === ""
    ) {
        return res.status(400).json({
            error: "Invalid credentials"
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
        email: normalizedEmail
    });
    if (!user) {
        return res.status(404).json({ msg: "Invalid Credentials" })
    }
    const isPasswordCorrect = await bcrypt.compare(
        req.body.password,
        user.password
    );
    if (!isPasswordCorrect) {
        return res.status(404).json({
            msg: "Invalid Credentials"
        });
    }
    const token = jwt.sign(
        { userId: user._id },
        secret,
        { expiresIn: "1d" }
    );
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    });

    return res.redirect("/homepage");
}

async function handleProfile(req, res) {
    try {
        const user = await User.findById(req.userId).select(
            "name email"
        );

        if (!user) {
            return res.redirect("/login");
        }

        return res.render("profile", {
            user
        });
    } catch (error) {
        console.error("Profile Error:", error);

        return res.status(500).send(
            "Something went wrong"
        );
    }
}


async function handleUpdateProfile(req, res) {
    try {
        const { name } = req.body;

        if (
            typeof name !== "string" ||
            name.trim() === ""
        ) {
            return res.status(400).json({
                error: "Name is required"
            });
        }

        if (name.trim().length > 50) {
            return res.status(400).json({
                error: "Name is too long"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                name: name.trim()
            },
            {
                new: true
            }
        ).select("name email");

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        return res.json({
            message: "Profile updated",
            user
        });
    } catch (error) {
        console.error(
            "Update Profile Error:",
            error
        );

        return res.status(500).json({
            error: "Something went wrong"
        });
    }
}


async function handleChangePassword(req, res) {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;

        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string"
        ) {
            return res.status(400).json({
                error: "Invalid password"
            });
        }

        if (
            currentPassword === "" ||
            newPassword === ""
        ) {
            return res.status(400).json({
                error: "All password fields are required"
            });
        }

        if (
            newPassword.length < 6 ||
            newPassword.length > 100
        ) {
            return res.status(400).json({
                error:
                    "New password must be between 6 and 100 characters"
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const isPasswordCorrect =
            await bcrypt.compare(
                currentPassword,
                user.password
            );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                error: "Current password is incorrect"
            });
        }

        const hashedPassword =
            await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        return res.json({
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error(
            "Change Password Error:",
            error
        );

        return res.status(500).json({
            error: "Something went wrong"
        });
    }
}


async function handleDeleteAccount(req, res) {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        await Conversation.deleteMany({
            userId: req.userId
        });

        await User.findByIdAndDelete(req.userId);

        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        return res.json({
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete Account Error:",
            error
        );

        return res.status(500).json({
            error: "Something went wrong"
        });
    }
}

module.exports = {
    handleCreatingUser,
    handleLoginUser,
    handleProfile,
    handleUpdateProfile,
    handleChangePassword,
    handleDeleteAccount
};