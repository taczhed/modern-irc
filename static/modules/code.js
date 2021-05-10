let nick
let color
let userId
let chat = []

const root = {

    init: function () {
        this.postUserInformations()
        this.sendMessege()
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

    postUserInformations: function () {

        const userInput = document.querySelector('#user-name')
        const userButton = document.querySelector('#start-button')
        const colorSelect = document.querySelector('#select-value')
        const colorSelectSpan = document.querySelector('#color-select')

        userButton.onclick = () => {

            if (userInput.value != "") {
                document.querySelector('.login').style.display = "none"

                nick = userInput.value
                if (colorSelect.value == "Color") color = "Dark"
                else color = colorSelect.value
                let body = {
                    nick: nick,
                    color: color
                }
                fetch("/sendUserInformations", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
                    .then(res => res.json())
                    .then(data => {
                        userId = data._id
                        this.alp()
                    })
                    .catch(error => console.log(error))

            } else {
                userInput.classList.add('is-danger')
                userButton.classList.add('is-danger')
                colorSelectSpan.classList.add('is-danger')
                userInput.setAttribute('placeholder', 'Invalid User Name')
            }
        }
    },

    sendMessege: function () {

        const myMessage = document.querySelector('#my-message')
        const messageButton = document.querySelector('#message-button')

        messageButton.onclick = () => {

            if (myMessage.value != "") {

                let message = {
                    nick: nick,
                    color: color,
                    text: myMessage.value
                }

                fetch("/sendMessage", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(message)
                })
                    .then(res => res.json())
                    .then(() => { })
                    .catch(error => console.log(error))
            }
        }


    },

    generateChat: function (messages) {

        const chat = document.querySelector('#chat-root')
        chat.innerHTML = ""

        for (let message of messages) {

            let className
            switch (message.color) {
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
        }
    }
}

root.init()
