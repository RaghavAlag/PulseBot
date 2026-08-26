const mongoose = require('mongoose');

// 1. Define the Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// 2. Create and Export the Model
const User = mongoose.model('User', userSchema);

module.exports = User;
