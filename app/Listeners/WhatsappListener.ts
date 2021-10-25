import Socket from '@ioc:App/Socket';
import { DateTime } from 'luxon';
import { Message } from 'whatsapp-web';
import Whatsapp from '@ioc:App/Whatsapp';
import Rabbit from '@ioc:App/Rabbit';

export default class WhatsappListener {
    async onNewMessage(message: Message) {

        Rabbit.channel.sendToQueue('new-message', Buffer.from(JSON.stringify(message), 'utf-8'))

    }

    async onAck(message) {
        Socket.emit('ack', message)
    }


    async onReady() {
        const chats = await Whatsapp.getChats()
        const unreads = chats.filter(chat => !chat.isGroup && chat.unreadCount > 0)

        console.time('queue-chats')
        for await (let chat of unreads) {
            const suporte:any = {}
            const contact = await chat.getContact()
            const imageUrl = await contact.getProfilePicUrl()

            suporte.name = contact.name || ''
            suporte.pushname = contact.pushname
            suporte.image_url = imageUrl
            suporte.chat_id = chat.id._serialized
            suporte.contact_id = contact.id._serialized
            suporte.status = 'ABERTO'
            suporte.openedAt = DateTime.local().toSQL()

            Rabbit.channel.sendToQueue('insert-suporte', Buffer.from(JSON.stringify(suporte), 'utf-8'))
           
        }
        console.timeEnd('queue-chats')
    }
    
}
