import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import qrcode from 'qrcode-terminal'
import { Events, Client as ClientWpp, Chat } from "whatsapp-web.js";
import Client from './Client.js'

declare module 'puppeteer' {
    interface LaunchOptions {
        browserWSEndpoint?: string,
        headless: boolean
    }
}

export class WhatsappService {

    public client: ClientWpp;
    public status: string;
    

    constructor(private app: ApplicationContract) {
        this.status = 'PENDENTE'
    }

    async start() {

        
        try {
            const Redis = this.app.container.use('Adonis/Addons/Redis')
            const Event = this.app.container.use('Adonis/Core/Event')
            const session = await Redis.get('whatsapp:session')
            this.client = new Client({
                puppeteer: {
                    headless: false,
                    // browserWSEndpoint: 'ws://127.0.0.1:9222/devtools/browser/cd3986a4-2ffc-42df-9277-6f7c96b477b7'
                }
            })

            this.client.on(Events.READY, ev => {
                if (this.client.info.pushname) {
                    this.status = 'READY'
                    this.app.logger.info(`Whatsapp ready: ${this.client.info.wid.user} `)

                    const socket = this.app.container.use('App/Socket')

                    socket.emit('status', this.status)
                }


            })

            this.client.on(Events.QR_RECEIVED, qr => {
                qrcode.generate(qr, { small: true })
            })

            
            this.client.on(Events.AUTHENTICATED, session => {
                // Redis.set('whatsapp:session', JSON.stringify(session))
            })

            this.client.on(Events.MESSAGE_RECEIVED, message => {
                Event.emit('whatsapp:MESSAGE_RECEIVED', message)
            })

            this.client.on(Events.MESSAGE_CREATE, message => {
                Event.emit('whatsapp:MESSAGE_CREATE', message)
            })

            this.client.on(Events.MESSAGE_ACK, message => {
                Event.emit('whatsapp:MESSAGE_ACK', message)
            })

            this.client.initialize()
        } catch (err) {
            this.app.logger.error('Erro no Whatsapp')
        }
    }

    async getChats(ids: string[] = []): Promise<Chat[]> {
        if(this.client.info.pushname) {
            const chats = await this.client.getChats()

            if(ids.length === 0) {
                return chats
            }

            return chats.filter(chat =>  ids.some(id => id === chat.id._serialized))
        }

        return []
    }

    async getChat(id: string): Promise<Chat> {
        if(this.client.info.pushname) {
            return this.client.getChatById(id)
        }   
        return {} as Chat
    }

}