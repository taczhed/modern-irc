const mongoose = require('mongoose')

const sessionSchema = mongoose.Schema({
    _id: String,
    time: String,
})

module.exports = mongoose.model('session', sessionSchema)