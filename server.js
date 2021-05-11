const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const path = require('path')
const bodyParser = require('body-parser')
const qs = require('querystring')

app.use(bodyParser.json())

// database
const mongoose = require("mongoose")
mongoose.connect('mongodb+srv://default:energy2000wisla1@modern-irc.cggrm.mongodb.net/modern-irc?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
const User = require('./models/user.js')
const Session = require('./models/session.js')

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

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/static/index.html"))

    // remove afk users

    let currentTime = functions.currentTime()
    currentTime = currentTime.split(':')
    let hours = currentTime[0]
    let minutes = currentTime[1]
    let secounds = currentTime[2]
    currentTime = new Date(hours, minutes, secounds).getTime()

    Session.find({})
        .exec()
        .then(docs => {
            for (let doc of docs) {
                let date = doc.time.split(':')
                let hours = date[0]
                let minutes = date[1]
                let secounds = date[2]
                date = new Date(hours, minutes, secounds).getTime()
                // about 5 minutes afk
                if (currentTime - date >= 25920000000) {
                    User.findOneAndDelete({ _id: doc._id }).exec().then(() => { console.log("delete afk user from Users") })
                    Session.findOneAndDelete({ _id: doc._id }).exec().then(() => { console.log("delete afk user from Session") })
                }
            }
        })
})

app.get("/clear", function (req, res) {
    User.deleteMany({})
        .exec()
        .then(() => {
            res.status(200).json("clear")
        })
})

app.post('/alp', (req, res) => {

    let body = req.body

    //update session time

    Session.updateOne(
        { _id: body.userId },
        { $set: { time: functions.currentTime() } }
    )
        .exec()
        .then(() => {

            // start loop

            let stopLoop = false
            const timeout = setTimeout(() => { stopLoop = true }, 10000);
            function pendingLoop() {
                const loop = setTimeout(function () {
                    if (stopLoop == true) {
                        User.findOne({ _id: body.userId })
                            .exec()
                            .then(doc => {
                                res.status(200).json(doc)
                            })
                    } else {
                        User.findOne({ _id: body.userId })
                            .exec()
                            .then(doc => {

                                if (doc.chat.toString() != body.chat.toString()) {
                                    res.status(200).json(doc)
                                } else {
                                    pendingLoop()
                                }
                            })
                    }
                }, 100)
            }
            pendingLoop()
        })
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

        const sessionObject = {
            _id: userObject._id,
            time: functions.currentTime()
        }

        const session = new Session(sessionObject)
        session.save()
            .catch(err => { console.log(err) })
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