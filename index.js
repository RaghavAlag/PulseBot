require("dotenv").config()
require("./redis");
const express = require('express');
const app = express()
const port = 3000
const static_route = require("./routes/static_route")
const userSignUp = require("./routes/userSignUp")
const connectDB = require("./connection");
const cookieParser = require("cookie-parser");
const homePage = require("./routes/homepage")
const auth = require("./middleware/auth")

//Connecting DataBase
connectDB();

app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());

app.use("/user", userSignUp)
app.use("/homepage", auth, homePage)
app.use("/", static_route)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})