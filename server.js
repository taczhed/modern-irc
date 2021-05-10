var express = require('express')
var app = express()
var PORT = process.env.PORT || 3000;
var path = require('path')
var bodyParser = require('body-parser');

// database
const mongoose = require("mongoose")
mongoose.connect('mongodb+srv://default:energy2000wisla1@modern-irc.cggrm.mongodb.net/modern-irc?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
const User = require('./models/user.js')

//functions

const functions = {
    makeID: function (length) {
        var result = []
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        var charactersLength = characters.length
        for (var i = 0; i < length; i++) {
            result.push(characters.charAt(Math.floor(Math.random() *
                charactersLength)))
        }
        return result.join('')
    },

    currentTime: function () {
        let date = new Date()
        let hours
        let minutes
        let seconds
        if (date.getHours().toString().length == 1) hours = "0" + date.getHours()
        else hours = date.getHours()
        if (date.getMinutes().toString().length == 1) minutes = "0" + date.getMinutes()
        else minutes = date.getMinutes()
        if (date.getSeconds().toString().length == 1) seconds = "0" + date.getSeconds()
        else seconds = date.getSeconds()
        date = hours + ":" + minutes + ":" + seconds
        return date
    },
}

app.use(bodyParser.json());

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/static/index.html"))
})

app.get("/clear", function (req, res) {
    User.deleteMany({})
        .exec()
        .then(() => {
            res.status(200).json("clear")
        })
})

app.post('/alp', (req, res) => {

    let stopLoop = false
    const timeout = setTimeout(() => { stopLoop = true }, 10000);
    function pendingLoop() {
        const loop = setTimeout(function () {
            if (stopLoop == true) res.status(200).json(null)
            else pendingLoop()
        }, 10)
    }
    pendingLoop()
})

app.post('/sendUserInformations', (req, res) => {

    const userObject = {
        _id: functions.makeID(25),
        nick: req.body.nick,
        color: req.body.color,
        chat: []
    }
    const user = new User(userObject)
    user.save().then(result => {
        // console.log(result)
        res.status(200).json(userObject)
    })
        .catch(err => { console.log(err) })

})

app.post('/sendMessage', (req, res) => {

    const messageObject = {
        time: functions.currentTime(),
        nick: req.body.nick,
        color: req.body.color,
        text: req.body.text
    }

    User.updateMany(
        {},
        { $push: { chat: messageObject } }
    )
        .exec()
        .then(() => {
            res.status(200).json(messageObject)
        })
})

app.listen(PORT, function () {
    console.log("Server running port: " + PORT)
})
app.use(express.static(path.join(__dirname, "static")));