import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { Events, Client, Chat, WAState } from "whatsapp-web";


declare module 'puppeteer' {
    interface LaunchOptions {
        browserWSEndpoint?: string,
        browserURL?: string,
        headless?: boolean,
        args: string[]
    }
}

declare module 'whatsapp-web' {
    interface Client {
        getMessageById(messageId: string): Promise<any>
    }
}

export class WhatsappService {

    public client: Client;
    public status: string;


    constructor(private app: ApplicationContract) {
        this.status = 'PENDENTE'
    }

    async start() {
        const Redis = this.app.container.use('Adonis/Addons/Redis')
        this.app.logger.info(`Estamos em ${this.app.nodeEnvironment}`)

        try {
            let config: any = {
                puppeteer: {
                    headless: process.env.headless || true,
                    args: ['--no-sandbox'],
                }
            }

            if (process.env.browserURL) {
                config.puppeteer.browserURL = process.env.browserURL
            } 
            
            if (process.env.browserWSEndpoint) {
                config.puppeteer.browserWSEndpoint = process.env.browserWSEndpoint
            }

            const session = await Redis.get('whatsapp:session')

            if(session) {
                config.session = JSON.parse(session)
            }

            this.client = new Client(config)
            const Event = this.app.container.use('Adonis/Core/Event')

            this.client.on(Events.READY, (state) => {
                Event.emit('whatsapp:READY', state)
                if (this.client.info.pushname) {
                    this.status = 'READY'
                    this.app.logger.info(`Whatsapp ready`)

                }
            })

            this.client.on(Events.QR_RECEIVED, qr => {
                this.status = 'QRCODE'
                this.app.logger.info('leia o qr code')
                Event.emit('whatsapp:QR_RECEIVED', qr)
            })

            this.client.on(Events.AUTHENTICATED, async session => {
                await Redis.set('whatsapp:session', JSON.stringify(session))
                this.status = 'READY'
                Event.emit('whatsapp:AUTHENTICATED', session)
            })

            this.client.on(Events.STATE_CHANGED, (state: WAState) => {
                Event.emit('whatsapp:STATE_CHANGED', state)
            })

            this.client.on(Events.MESSAGE_RECEIVED, message => {
                Event.emit('whatsapp:MESSAGE_RECEIVED', message)
            })

            this.client.on(Events.MESSAGE_CREATE, message => {
                Event.emit('whatsapp:MESSAGE_CREATE', message)
            })

            this.client.on(Events.MESSAGE_ACK, ack => {
                Event.emit('whatsapp:MESSAGE_ACK', ack)
            })

            this.client.on(Events.DISCONNECTED, () => {
                
            })

            this.client.initialize()

        } catch (err) {
            this.app.logger.error('Erro no Whatsapp', err)
        }
    }

    async getChats(ids: string[] = []): Promise<Chat[]> {
        if (this.client.info.pushname) {
            const chats = await this.client.getChats()

            if (ids.length === 0) {
                return chats
            }

            return chats.filter(chat => ids.some(id => id === chat.id._serialized))
        }

        return []
    }

    async getChat(id: string): Promise<Chat> {

        if (this.client.info.pushname) {
            return this.client.getChatById(id)
        }
        return {} as Chat
    }

}