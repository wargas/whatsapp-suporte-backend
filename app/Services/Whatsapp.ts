import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import qrcode from 'qrcode-terminal'
import { Client, Events } from "whatsapp-web.js";

declare module 'puppeteer' {
    interface LaunchOptions {
        browserWSEndpoint: string
    }
}



export class WhatsappService {

    public client: Client;
    public status: string;

    constructor(private app: ApplicationContract) {
        this.status = 'PENDENTE'
    }

    async start() {
        try {
            const Redis = this.app.container.use('Adonis/Addons/Redis')
            const Event = this.app.container.use('Adonis/Core/Event')
            const session = await Redis.get('whatsapp:session')
            if (session) {
                this.client = new Client({
                    session: JSON.parse(session),
                    puppeteer: {
                        browserWSEndpoint: 'ws://157.245.218.108:3000/'
                    }
                })
            } else {
                this.client = new Client({
                    puppeteer: {
                        browserWSEndpoint: 'ws://157.245.218.108:3000/'
                    }
                })
            }

            this.client.on(Events.READY, ev => {
                if (this.client.info.pushname) {
                    this.status = 'READY'
                    this.app.logger.info(`Whatsapp ready: ${this.client.info.wid.user} `)
                }
            })

            this.client.on(Events.QR_RECEIVED, qr => {
                qrcode.generate(qr, { small: true })
            })

            this.client.on(Events.AUTHENTICATED, session => {
                Redis.set('whatsapp:session', JSON.stringify(session))
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

}