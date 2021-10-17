import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { Events, Client as ClientWpp, Chat, WAState } from "whatsapp-web.js";
import Client from './Client.js'

declare module 'puppeteer' {
    interface LaunchOptions {
        browserWSEndpoint?: string,
        headless?: boolean
    }
}
 
declare module 'whatsapp-web.js' {   
    interface Client { 
        getMessageById(messageId: string): Promise<any>
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
            const Event = this.app.container.use('Adonis/Core/Event')
            
            this.client = new Client({
                puppeteer: {
                    browserWSEndpoint: 'ws://127.0.0.1:9222/devtools/browser/16a680ef-6828-4d72-96eb-30e2dce343b8',
                    headless: false,
                    args: ['--no-sandbox']
                }
            })

                       
            this.client.on(Events.READY, (state) => {
                Event.emit('whatsapp:READY', state)
                if (this.client.info.pushname) {
                    this.status = 'READY'
                    this.app.logger.info(`Whatsapp ready: ${this.client.info.wid.user} `)
                  
                }
            })

            this.client.on(Events.QR_RECEIVED, qr => {  
                this.status = 'QRCODE'
                Event.emit('whatsapp:QR_RECEIVED', qr)
            })

            this.client.on(Events.AUTHENTICATED, session => {
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

            this.client.initialize()  

        } catch (err) {
            this.app.logger.error('Erro no Whatsapp', err)
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