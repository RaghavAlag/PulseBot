const secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        const data = jwt.verify(token, secret);
        const user = await User.findById(data.userId);

        if (!user) {
            return res.render("login");
        }
        req.userId = data.userId;

        next();
    } catch (error) {
        return res.render("login");
    }
};
module.exports = auth;
