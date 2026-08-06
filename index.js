const express = require('express');
const app = express()
const port = 3000
const static_route = require("./routes/static_route")
const userSignUp = require("./routes/userSignUp")
const connectDB = require("./connection");

//Connecting DataBase
connectDB();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use("/user",userSignUp)
app.use("/",static_route)

// app.get('/', (req, res) => {
//     res.render('static_route');
// });

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})