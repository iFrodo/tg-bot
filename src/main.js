const {HtmlTelegramBot, userInfoToString} = require("./bot");
const ChatGptService = require("./gpt");

class MyTelegramBot extends HtmlTelegramBot {
    constructor(token) {
        super(token);
        this.mode = null;
        this.list = [];
        this.user = {};
        this.count = 0;
    }

    async date(msg) {
        this.mode = 'date'
        await this.sendImage('date')
        await this.sendTextButtons(this.loadMessage('date'), {
            'date_grande': 'Ариана Гранде',
            'date_robbie': 'Марго Робби',
            'date_zendaya': 'Зендея',
            'date_gosling': 'Райан Гослинг',
            'date_hardy': 'Том Харди',
        })
    }

    async dateButton(callbackQuery) {
        const data = callbackQuery.data
        await this.sendImage(data)
        let name = ''
        if (data === 'date_grande') {
            name = 'Ариану Гранде'
        } else if (data === 'date_robbie') {
            name = 'Марго Робби'
        } else if (data === 'date_zendaya') {
            name = 'Зендайю'
        } else if (data === 'date_gosling') {
            name = 'Райана Гослинга'
        } else if (data === 'date_hardy') {
            name = 'Тома Харди'
        }
        await this.sendText(`Пригласи на свидание ${name} за 5 сообщений! `)
        const prompt = this.loadPrompt(data)
        chatGpt.setPrompt(prompt);
    }

    async dateDialog(msg) {
        const text = msg.text;
        const message = await this.sendText('набирает сообщение...')
        const response = await chatGpt.addMessage(text)
        await this.editText(message, response)
    }

    async message() {
        this.mode = 'message'
        this.list = []
        await this.sendImage('message')
        await this.sendTextButtons(this.loadMessage('message'), {
            "message_next": "Следующее сообщение",
            "message_date": "Пригласить на свидание"
        })
    }

    async messageButton(callbackQuery) {
        console.log(this.list)
        const query = callbackQuery.data
        const prompt = this.loadPrompt(query)
        const userChatHistory = this.list.join('\n\n');
        const message = await this.sendText('ChatGPT набирает текст ...')
        console.log(prompt, userChatHistory)
        const response = await chatGpt.sendQuestion(prompt, userChatHistory)
        await this.editText(message, response)
        this.list.push(response)
    }

    async messageDialog(msg) {
        const text = msg.text

        // const message = await this.sendText('набирает сообщение...')
        // const response = await chatGpt.addMessage(text)

        this.list.push(text)
    }

    async profile() {
        this.count = 0
        this.user = {}
        this.mode = 'profile'
        await this.sendImage('profile')
        await this.sendText(this.loadMessage('profile'))
        await this.sendText('Сколько вам лет?')

    }

    async profileDialog(msg) {
        const text = msg.text
        this.count++
        if (this.count === 1) {
            this.user['age'] = text
            await this.sendText('Кем вы работаете?')
        }
        if (this.count === 2) {
            this.user['occupation'] = text
            await this.sendText('У вас есть хобби?')
        }
        if (this.count === 3) {
            this.user['hobby'] = text
            await this.sendText('Что вам не нравится в людях?')
        }
        if (this.count === 4) {
            this.user['annoys'] = text
            await this.sendText('Цель знакомства?')
        }
        if (this.count === 5) {
            this.user['goals'] = text

            const prompt = this.loadPrompt('profile')
            const info = userInfoToString(this.user)
            const message = await this.sendText('ChatGPT генерирует профиль ...')
            const answer = await chatGpt.sendQuestion(prompt, info)

            await this.editText(message, answer)
        }


    }

    async opener() {
        this.mode = 'opener'
        this.user = {}
        this.count = 0
        await this.sendImage('opener')
        await this.sendText(this.loadMessage('opener'))
        await this.sendText('Имя?')
    }

    async openerDialog(msg) {
        const text = msg.text
        this.count++
        if (this.count === 1) {
            this.user['name'] = text
            await this.sendText('Сколько ей лет')
        }
        if (this.count === 2) {
            this.user['age'] = text
            await this.sendText('Оцените внешность: 1-10 баллов?')
        }
        if (this.count === 3) {
            this.user['handsome'] = text
            await this.sendText('Кем работает?')
        }
        if (this.count === 4) {
            this.user['occupation'] = text
            await this.sendText('Цель знакомства?')
        }
        if (this.count === 5) {
            this.user['goals'] = text
            const prompt = this.loadPrompt('opener')
            const info = userInfoToString(this.user)
            const message = await this.sendText('ChatGPT генерирует опенер ...')
            const answer = await chatGpt.sendQuestion(prompt, info)
            await this.editText(message, answer)
        }
    }

    async gpt(msg) {
        this.mode = 'gpt'
        await this.sendText('Пообщаемся с ИИ')
        await this.sendImage('gpt')
        await this.sendText(this.loadMessage('gpt'))
    }

    async gptDialog(msg) {
        const text = msg.text;
        const message = await this.sendText('набирает сообщение ...')
        const response = await chatGpt.sendQuestion('Ответь на вопрос', text)
        await this.editText(message, response)
    }

    async start() {
        this.mode = 'start'
        await this.sendImage('main')
        const text = this.loadMessage('main')
        await this.sendText(text)

        //show menu
        await this.showMainMenu({
            'start': 'Начать',
            'gpt': 'Задать вопрос чату GPT 🧠',
            'profile': '*Генерация Tinder-профиля 😎',
            'opener ': '*Сообщение для знакомства 🥰',
            'message': '*Переписка от вашего имени 😈',
            'date': '*Переписка со звездами 🔥'
        })
    }

    async hello(msg) {
        if (this.mode === 'gpt') {
            await this.gptDialog(msg)
        } else if (this.mode === 'date') {
            await this.dateDialog(msg)
        } else if (this.mode === 'message') {
            await this.messageDialog(msg)
        } else if (this.mode === 'profile') {
            await this.profileDialog(msg)
        } else if (this.mode === 'opener') {
            await this.openerDialog(msg)
        } else {
            const text = msg.text
            await this.sendText('<b>Привет!</b>')
            await this.sendText('<i>Как дела?</i>')
            await this.sendText(`Вы писали: ${text}`)
            await this.sendImage('avatar_main')
            await this.sendTextButtons('Какая у вас тема в Телеграм?', {
                'theme_light': 'Светлая', 'theme_dark': 'Темная'
            })
        }

    }

    async helloButton(callbackQuery) {
        const query = callbackQuery.data
        query === 'theme_light' ? await this.sendText('У вас светлая тема ') : await this.sendText('У вас тёмная тема')
    }

    async html(msg) {

        await this.sendHTML("<h3 style='color:red;'>Привет</h3>", {theme: 'dark'})
        const html = this.loadHtml('main')
        await this.sendHTML(html, {theme: 'dark'})
    }
}

const chatGpt = new ChatGptService('')
const bot = new MyTelegramBot('');
bot.onCommand(/\/start/, bot.start) // /start
bot.onCommand(/\/html/, bot.html) // /html
bot.onCommand(/\/gpt/, bot.gpt) // /gpt
bot.onCommand(/\/date/, bot.date) // /date
bot.onCommand(/\/message/, bot.message) // /message
bot.onCommand(/\/profile/, bot.profile) // /message
bot.onCommand(/\/opener/, bot.opener) // /message
bot.onTextMessage(bot.hello)
bot.onButtonCallback(/^date_.*/, bot.dateButton) // data_*
bot.onButtonCallback(/^theme_.*/, bot.helloButton) // theme_*
bot.onButtonCallback(/^message_.*/, bot.messageButton) // any string

// Мы будем писать тут наш код