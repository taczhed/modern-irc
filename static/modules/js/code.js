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
    },

    translateColors: function (color) {
        let className
        switch (color) {
            case 'Red':
                className = "is-danger"
                break
            case 'Green':
                className = "is-success"
                break
            case 'Blue':
                className = "is-link"
                break
            case 'Dark':
                className = "is-dark"
                break
            case 'Cyan':
                className = "is-info"
                break
            case 'Turquoise':
                className = "is-primary"
                break
            case 'Yellow':
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

            p.innerHTML = `@${message.nick} - ${message.time}`
            text.innerHTML = message.text

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
