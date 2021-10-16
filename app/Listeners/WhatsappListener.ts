import Socket from '@ioc:App/Socket';
import Wpp from '@ioc:App/Whatsapp'
import Suporte from 'App/Models/Suporte';
import { DateTime } from 'luxon';
import { Message } from 'whatsapp-web.js';

export default class WhatsappListener {
    async onNewMessage(message: Message) {

        const contato = await Wpp.client.getContactById(message.from)
        const imageUrl = await contato.getProfilePicUrl()

        try {

            if (message.id._serialized === 'status@broadcast') {
                console.log('message from status')
                return;
            }
            const chat = await Wpp.client.getChatById(message.from)

            if(!chat) {
                return;
            }

            if (chat?.isGroup) {
                console.log('message from group')
                return;
            }

            if (!message.fromMe) {
                let suporte = await Suporte
                    .query()
                    .where('chat_id', message.from)
                    .where('status', 'ABERTO')
                    .first()
               

                if (!suporte) {
                    suporte = await Suporte.create({
                        name: contato.name,
                        pushname: contato.pushname,
                        image_url: imageUrl,
                        chat_id: message.from,
                        contact_id: contato.id._serialized,
                        status: 'ABERTO',
                        openedAt: DateTime.local()
                    })
                } else {
                    await suporte.merge({
                        name: contato.name,
                        pushname: contato.pushname,
                        image_url: imageUrl
                    })
                }
                console.log(suporte.id)
            }

            Socket.emit('message', { ...message, chat })


        } catch (error) {

            console.log('error', error)
            return;
        }
    }

    async onAck(message) {
        Socket.emit('ack', message)
    }
}
