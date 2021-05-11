import { emoticons } from "./emoticons.js"

let nick
let color
let userId
let chat = []

const root = {

    init: function () {
        this.postUserInformations()
        this.sendMessege()
    },

    postUserInformations: function () {

        const userInput = document.querySelector('#user-name')
        const userButton = document.querySelector('#start-button')
        const colorSelect = document.querySelector('#select-value')
        const colorSelectSpan = document.querySelector('#color-select')
        const header = document.querySelector('#header')

        userButton.onclick = () => {

            if (userInput.value != "") {
                document.querySelector('.login').style.display = "none"
                nick = userInput.value

                if (colorSelect.value == "Random Color") {
                    const colors = ["Red", "Green", "Blue", "Dark", "Cyan", "Turquoise", "Yellow"]
                    const random = Math.floor(Math.random() * 7)
                    color = colors[random]
                } else {
                    color = colorSelect.value
                }

                header.classList.add(this.translateColors(color))

                async function sendPost() {

                    const headers = { 'Content-Type': 'application/json' }
                    const body = JSON.stringify({
                        nick: nick,
                        color: color
                    })
                    let response = await fetch("/sendUserInformations", { method: "POST", body, headers })

                    if (!response.ok)
                        return respose.status
                    else {
                        let data = await response.json()
                        userId = data._id
                        root.alp()
                        root.enterButton()
                    }
                }

                sendPost()

            } else {
                userInput.classList.add('is-danger')
                userButton.classList.add('is-danger')
                colorSelectSpan.classList.add('is-danger')
                userInput.setAttribute('placeholder', 'Invalid Nick')
            }
        }
    },

    enterButton: function () {
        const input = document.getElementById("my-message")
        input.addEventListener("keyup", (e) => {
            if (e.keyCode === 13) {
                e.preventDefault()
                document.getElementById("message-button").click()
            }
        })
    },

    alp: function () {

        function pending() {
            $.ajax({
                method: "POST",
                url: "/alp",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify({
                    nick: nick,
                    color: color,
                    userId: userId,
                    chat: chat
                })
            })
                .done(function (data) {
                    // console.log("success", data)
                    chat = data.chat
                    root.generateChat(chat)
                    pending()
                })
        }
        pending()
    },

    sendMessege: function () {

        const myMessage = document.querySelector('#my-message')
        const messageButton = document.querySelector('#message-button')

        messageButton.onclick = () => {

            if (myMessage.value != "") {

                let message = myMessage.value.split(' ')

                if (message.includes('/nick') || message.includes('/color')) {

                    let newColor = color
                    let newNick = nick

                    if (message.includes('/nick')) {
                        let indexOfNick = message.indexOf('/nick')
                        if (indexOfNick + 1 == message.length) newNick = nick
                        else newNick = message[indexOfNick + 1]
                    } else {
                        let indexOfColor = message.indexOf('/color')
                        if (indexOfColor + 1 == message.length) newColor = nick
                        else newColor = message[indexOfColor + 1]
                    }

                    async function sendPost() {
                        const headers = { 'Content-Type': 'application/json' }
                        const body = JSON.stringify({
                            userId: userId,
                            newNick: newNick,
                            newColor: newColor,
                            oldNick: nick,
                            oldColor: color
                        })
                        let response = await fetch("/changeUser", { method: "POST", body, headers })
                        if (!response.ok)
                            return respose.status
                        else {
                            const data = await response.json()
                            const header = document.querySelector('#header')
                            header.classList.remove(root.translateColors(color))
                            header.classList.add(root.translateColors(data.color))
                            nick = data.nick
                            color = data.color
                            myMessage.value = ""
                        }
                    }
                    sendPost()

                } else if (message.includes('/quit')) {
                    location.reload();
                } else {
                    async function sendPost() {
                        const headers = { 'Content-Type': 'application/json' }
                        const body = JSON.stringify({
                            nick: nick,
                            color: color,
                            text: myMessage.value
                        })
                        let response = await fetch("/sendMessage", { method: "POST", body, headers })

                        if (!response.ok)
                            return respose.status
                        else {
                            await response.json()
                            myMessage.value = ""
                        }
                    }
                    sendPost()
                }
            }
        }
    },

    translateColors: function (color) {
        let className
        switch (color.toLowerCase()) {
            case 'red':
                className = "is-danger"
                break
            case 'green':
                className = "is-success"
                break
            case 'blue':
                className = "is-link"
                break
            case 'dark':
                className = "is-dark"
                break
            case 'cyan':
                className = "is-info"
                break
            case 'turquoise':
                className = "is-primary"
                break
            case 'yellow':
                className = "is-warning"
                break
        }
        return className
    },

    generateChat: function (messages) {

        const chat = document.querySelector('#chat-root')
        chat.innerHTML = ""

        for (let message of messages) {

            const className = this.translateColors(message.color)

            const article = document.createElement('article')
            const header = document.createElement('div')
            const p = document.createElement('p')
            const text = document.createElement('div')

            article.classList.add('message', 'is-small', className)
            header.classList.add('message-header', 'py-1')
            text.classList.add('message-body')

            p.innerText = `@${message.nick} - ${message.time}`
            text.innerText = message.text

            chat.appendChild(article)
            article.appendChild(header)
            header.appendChild(p)
            article.appendChild(text)

            emoticons()
        }

        //auto scroll
        // const element = document.getElementById("chat-root")
        // element.scrollTop = element.scrollHeight
    }
}

root.init()
