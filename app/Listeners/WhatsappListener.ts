import Socket from '@ioc:App/Socket';
import Wpp from '@ioc:App/Whatsapp'
import Logger from '@ioc:Adonis/Core/Logger'
import Suporte from 'App/Models/Suporte';
import { DateTime } from 'luxon';
import { Message } from 'whatsapp-web';
import Whatsapp from '@ioc:App/Whatsapp';

export default class WhatsappListener {
    async onNewMessage(message: Message) {

        if (message.isStatus) {
            return;
        }

        try {

            const chat = await Wpp.client.getChatById(message.from)
            const contato = await chat.getContact()
            const imageUrl = await contato.getProfilePicUrl()

            if (message.fromMe) {
                Socket.emit('message', { ...message, chat })

                return;
            }



            if (!chat || chat.isGroup) {
                return;
            }

            let suporte = new Suporte()

            suporte.name = contato.name || ''
            suporte.pushname = contato.pushname || ''
            suporte.image_url = imageUrl
            suporte.chat_id = chat.id._serialized
            suporte.contact_id = contato.id._serialized
            suporte.status = 'ABERTO'
            suporte.openedAt = DateTime.local()

            await this.createOrUpdateSuporte(suporte)


            Socket.emit('message', { ...message, chat })


        } catch (error) {
            Logger.error(error)
            return;
        }
    }

    async onAck(message) {
        Socket.emit('ack', message)
    }


    async onReady() {
        const chats = await Whatsapp.getChats()
        const unreads = chats.filter(chat => !chat.isGroup && chat.unreadCount > 0)

        for await (let chat of unreads) {
            const suporte = new Suporte()
            const contact = await chat.getContact()
            const imageUrl = await contact.getProfilePicUrl()

            suporte.name = contact.name || ''
            suporte.pushname = contact.pushname
            suporte.image_url = imageUrl
            suporte.chat_id = chat.id._serialized
            suporte.contact_id = contact.id._serialized
            suporte.status = 'ABERTO'
            suporte.openedAt = DateTime.local()

            await this.createOrUpdateSuporte(suporte)
        }
    }

    async createOrUpdateSuporte(item: Suporte): Promise<Suporte> {

        Logger.info('Criando Suporte')
        let suporte = await Suporte
            .query()
            .where('chat_id', item.chat_id)
            .where('status', 'ABERTO')
            .first()


        if (!suporte) {
            suporte = await Suporte.create(item)
        } else {
            await suporte.merge({
                name: item.name,
                pushname: item.pushname,
                image_url: item.image_url
            })
        }

        return suporte
    }
}
