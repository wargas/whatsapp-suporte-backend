import fs from 'fs';
import path from 'path'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Whatsapp from '@ioc:App/Whatsapp';

import Suporte from "App/Models/Suporte";
import { DateTime } from 'luxon';
import Application from '@ioc:Adonis/Core/Application'
import { MessageMedia } from 'whatsapp-web';
import User from 'App/Models/User';
import Redis from '@ioc:Adonis/Addons/Redis';
import Rabbit from '@ioc:App/Rabbit';
import Socket from '@ioc:App/Socket';


export default class SuportesController {

    async index() {
        return await Suporte.query()
    }

    async novoSuporte({ params, auth }: HttpContextContract) {
        const contato_id = params.id;

        const contato = await Whatsapp.client.getContactById(contato_id)

        const chat = await contato.getChat()

        const imgUrl = await contato.getProfilePicUrl()

        const suporte = await Suporte.create({
            name: contato.name || contato.pushname,
            chat_id: chat.id._serialized,
            image_url: imgUrl,
            openedAt: DateTime.local(),
            user_id: auth.user?.id || 0,
            status: 'ABERTO'
        })

        return suporte;
    }

    async userSuportes({ auth }: HttpContextContract) {

        const suportes = await Suporte.query()
            .where('status', 'ABERTO')
            .where('user_id', auth?.user?.id || 0)
            .orderBy('updated_at', 'desc')

        const abertos = await Redis.get('count-fila') || '0'

        return {
            suportes,
            fila: parseInt(abertos) || 0
        }
    }

    async finalizarSuporte({ params, request, auth }: HttpContextContract) {
        const suporte = await Suporte.query()
            .where('id', params.id)
            .where('user_id', auth?.user?.id || 0)
            .first()
        const { message = null } = request.all()

        if (!suporte) {
            return { error: 'NOT_FOUND' }
        }

        const user = await User.findOrFail(auth.user?.id)

        if (message) {
            await Whatsapp.client
                .sendMessage(suporte.chat_id, `*${user.name}:*\n${message}`)
        }

        suporte.status = 'FECHADO'
        suporte.closedAt = DateTime.local()
        await suporte.save()

        await Rabbit.channel.sendToQueue('update-count-fila', Buffer.from(''))

        return suporte

    }

    async getNextSuporte({ auth }: HttpContextContract) {
        const next = await Suporte.query()
            .whereNull('user_id')
            .where('status', 'aberto')
            .orderBy('opened_at', 'asc')
            .first()

        if (!next) {
            await Rabbit.channel.sendToQueue('update-count-fila', Buffer.from(''))
            return { error: 'NOT_FOUND' }
        }

        next.user_id = auth.user?.id || 0
        await next.save()

        await Rabbit.channel.sendToQueue('update-count-fila', Buffer.from(''))

        return next;

    }

    async show({ params, response }: HttpContextContract) {
        const suporte = await Suporte.findBy('id', params.id)
        if (!suporte) {
            return response.status(404).json({})
        }
        const chat = await Whatsapp.getChat(suporte?.chat_id)
        const messages = await chat.fetchMessages({ limit: 50 })
       
        

        if (chat.unreadCount > 0) {
            await chat.sendSeen()
        }

        if(suporte.unreads > 0) {
            suporte.unreads = 0
            await suporte.save()
            await Socket.emit('update-suporte', suporte)
        }

        return { ...suporte.serialize(), messages }
    }

    async getMessages(ctx: HttpContextContract) {
        const suporte = await Suporte.findBy('id', ctx.params.id)
        if (!suporte) {
            return []
        }

        const chat = await Whatsapp.client.getChatById(suporte.chat_id);
        await chat.sendSeen()

        const messages = await chat.fetchMessages({ limit: 50 })
        return messages
    }

    async sendMessage({ params, request, auth }: HttpContextContract) {
        const { message } = request.all()

        const user = await User.findOrFail(auth.user?.id)

        const chat = await Suporte.find(params.id);

        if (!chat) {
            return {}
        }

        return await Whatsapp.client
            .sendMessage(chat.chat_id, `*${user?.name}:*\n${message}`)
    }

    async sendMedia({ request, params }: HttpContextContract) {
        const chat = await Suporte.find(params.id);
        if (!chat) {
            return {}
        }


        const filePath = request.file('file')?.tmpPath
        const fileName = request.file('file')?.clientName


        const type = request.input('type')


        if (filePath) {
            const _media = MessageMedia.fromFilePath(filePath)

            const media = new MessageMedia(type, _media.data, fileName)
            return await Whatsapp.client.sendMessage(
                chat?.chat_id,
                media
            )
        }

        return []
    }

    async status() {
        const status = Whatsapp.status;

        return { status }
    }

    async media({ params, response, logger }: HttpContextContract) {
        const uploadPath = Application.resourcesPath('media')

        const message = await Whatsapp.client.getMessageById(params.id)

        const fileUrl = path.join(uploadPath, message.id.id)

        if (!await fs.existsSync(fileUrl)) {
            try {
                const media = await message.downloadMedia();
                await fs.writeFileSync(fileUrl, media.data, { encoding: 'base64' })
            } catch (error) {
                return error;
            }
        }

        const file = fs.createReadStream(fileUrl)

        response.stream(file, error => {
            logger.error(error.message)
        })

    }
}
