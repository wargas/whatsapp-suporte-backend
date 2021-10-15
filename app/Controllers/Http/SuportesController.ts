import fs from 'fs';
import path from 'path'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Whatsapp from '@ioc:App/Whatsapp';

import Suporte from "App/Models/Suporte";
import { DateTime } from 'luxon';
import Application from '@ioc:Adonis/Core/Application'


export default class SuportesController {

    async index() {
        return await Suporte.query()
        // .where('status', 'ABERTO')
    }

    async userSuportes({ auth }: HttpContextContract) {

        const suportes = await Suporte.query()
            .where('status', 'ABERTO')
            .where('user_id', auth?.user?.id || 0)


        const ids = suportes.map(item => item.chat_id)

        const chats = await Whatsapp.getChats(ids)

        const abertos = await Suporte.query()
            .where('status', 'ABERTO')
            .whereNull('user_id')

        return {
            suportes: suportes.map(suporte => {
                const chat = chats.find(chat => chat.id._serialized === suporte.chat_id)
                return {
                    ...suporte.serialize(),
                    unreadCount: chat?.unreadCount || 0
                }
            }), fila: abertos.length
        }
    }

    async finalizarSuporte({ params, auth }: HttpContextContract) {
        const suporte = await Suporte.query()
            .where('id', params.id)
            .where('user_id', auth?.user?.id || 0)
            .first()

        if (!suporte) {
            return { error: 'NOT_FOUND' }
        }

        suporte.status = 'FECHADO'
        suporte.closedAt = DateTime.local()
        await suporte.save()

        return suporte

    }

    async getNextSuporte({ auth }: HttpContextContract) {
        const next = await Suporte.query()
            .whereNull('user_id')
            .where('status', 'aberto')
            .orderBy('opened_at', 'asc')
            .first()

        if (!next) {
            return { error: 'NOT_FOUND' }
        }

        next.user_id = auth.user?.id || 0
        await next.save()

        return next;

    }

    async show({ params, response }: HttpContextContract) {
        const suporte = await Suporte.findBy('id', params.id)
        if (!suporte) {
            return response.status(404).json({})
        }
        const chat = await Whatsapp.getChat(suporte?.chat_id)

        await chat.sendSeen()

        return suporte
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

    async sendMessage(ctx: HttpContextContract) {
        const { message } = ctx.request.all()

        const chat = await Suporte.find(ctx.params.id);

        if (!chat) {
            return {}
        }

        return await Whatsapp.client.sendMessage(chat.chat_id, message)
    }

    async status() {
        const status = Whatsapp.status;

        return { status }
    }

    async media({ params, response }: HttpContextContract) {
        const uploadPath = Application.resourcesPath('media')

        const message = await Whatsapp.client.getMessageById(params.id)

        const fileUrl = path.join(uploadPath, message.id.id)

        if (!await fs.existsSync(fileUrl)) {            
            try {
                const media = await message.downloadMedia();
                await fs.writeFileSync(fileUrl, media.data, { encoding: 'base64' })
                console.log('Criar a imagem')

            } catch (error) {
                return error;
            }

        }

        
        const file = fs.createReadStream(fileUrl)

        response.stream(file, error => {
            console.log(error)
        })

    }
}
