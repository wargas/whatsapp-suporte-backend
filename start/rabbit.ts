import Rabbit from "@ioc:App/Rabbit";
import Socket from "@ioc:App/Socket";
import Whatsapp from "@ioc:App/Whatsapp";
import { ConsumeMessage } from "amqplib";
import Suporte from "App/Models/Suporte";
import { DateTime } from "luxon";
import { Message } from "whatsapp-web";
import Logger from '@ioc:Adonis/Core/Logger'
import Redis from "@ioc:Adonis/Addons/Redis";

/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/
Rabbit.channel.consume('new-message', async (msg: ConsumeMessage) => {
    
    if(Whatsapp.status !== 'READY') {
        await Rabbit.channel.nack(msg)

        return;
    }
    
    const message: Message = JSON.parse(msg?.content.toString('utf-8') || '')
    
    if (message.isStatus) {
        await Rabbit.channel.ack(msg)
        return;
    }

    try {
        const chat = await Whatsapp.client.getChatById(message.from)
        const contato = await chat.getContact()
        const imageUrl = await contato.getProfilePicUrl()

        if (message.fromMe) {
            Socket.emit('message', { ...message, chat })
            await Rabbit.channel.ack(msg)
            return;
        }

        if (!chat || chat.isGroup) {
            await Rabbit.channel.ack(msg)
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

        await createOrUpdateSuporte(suporte)
        Socket.emit('message', { ...message, chat })

        await Rabbit.channel.ack(msg)
    } catch (error) {

        console.log(error.sqlMessage)

        await Rabbit.channel.nack(msg)
    }

})

Rabbit.channel.consume('insert-suporte', async (msg: ConsumeMessage) => {
    const suporte: Suporte = JSON.parse(msg?.content.toString() || '')
    
    try {
        await createOrUpdateSuporte(suporte)

        await Rabbit.channel.ack(msg)
    } catch (error) {
        await Rabbit.channel.nack(msg)
    }
})

Rabbit.channel.consume('update-count-fila', async(msg: ConsumeMessage) => {

    const abertos = await Suporte.query()
    .where('status', 'ABERTO')
    .whereNull('user_id')

    console.log('update-count-fila', abertos.length)

    await Socket.emit('count_fila', abertos.length)
    await Redis.set('count-fila', abertos.length)

    await Rabbit.channel.ack(msg)
})

const createOrUpdateSuporte = async (item: Suporte): Promise<Suporte> => {

    item.pushname = item.pushname.replace(/[^a-zA-Z0-9_\. ]/g, "")
    item.name = item.name.replace(/[^a-zA-Z0-9_\. ]/g, "")
    
    let suporte = await Suporte
        .query()
        .where('chat_id', item.chat_id)
        .where('status', 'ABERTO')
        .first()


    if (!suporte) {
        suporte = await Suporte.create(item)
        await Rabbit.channel.sendToQueue('update-count-fila', Buffer.from(''))
    } else {
        await suporte.merge({
            name: item.name,
            pushname: item.pushname,
            image_url: item.image_url
        })
    }

    Logger.info(`Suporte criado/atualizado ${suporte.id}`)

    return suporte
}