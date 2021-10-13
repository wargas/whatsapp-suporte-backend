import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Whatsapp from '@ioc:App/Whatsapp';

import Suporte from "App/Models/Suporte";

export default class SuportesController {

    async index() {
        return await Suporte.query()
            // .where('status', 'ABERTO')
    }

    async show(ctx: HttpContextContract) {
        return await Suporte.findBy('id', ctx.params.id)
    }

    async getMessages(ctx: HttpContextContract) {
        const suporte = await Suporte.findBy('id', ctx.params.id)
        if(!suporte) {
            return []
        }

        const chat = await Whatsapp.client.getChatById(suporte.chat_id);

        const messages = await chat.fetchMessages({limit: 10})

        return messages
    }

    async sendMessage(ctx: HttpContextContract) {
        const { message } = ctx.request.all()

        const chat = await Suporte.find(ctx.params.id);

        if(!chat) {
            return {}
        }

        return await Whatsapp.client.sendMessage(chat.chat_id, message)
    }

    async status() {
        const status = Whatsapp.status;

        return { status }
    }
}
