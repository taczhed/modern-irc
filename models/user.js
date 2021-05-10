const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    _id: String,
    nick: String,
    color: String,
    chat: Array
})

module.exports = mongoose.model('user', userSchema)