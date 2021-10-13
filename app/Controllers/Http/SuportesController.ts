import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Whatsapp from '@ioc:App/Whatsapp';

import Suporte from "App/Models/Suporte";
import { DateTime } from 'luxon';

export default class SuportesController {

    async index() {
        return await Suporte.query()
            // .where('status', 'ABERTO')
    }

    async userSuportes({auth}: HttpContextContract) {
        const suportes = await Suporte.query()
            .where('status', 'ABERTO')
            .where('user_id', auth?.user?.id || 0)
        
        const abertos = await Suporte.query()
            .where('status', 'ABERTO')
            .whereNull('user_id')

        return {suportes, fila: abertos.length}
    }

    async finalizarSuporte({params, auth}: HttpContextContract) {
        const suporte = await Suporte.query()
            .where('id', params.id)
            .where('user_id', auth?.user?.id || 0 )
            .first()

        if(!suporte) {
            return {error: 'NOT_FOUND'}
        }

        suporte.status = 'FECHADO'
        suporte.closedAt = DateTime.local()
        await suporte.save()

        return suporte

    }

    async getNextSuporte({auth}: HttpContextContract) {
        const next = await Suporte.query()
            .whereNull('user_id')
            .where('status', 'aberto')
            .orderBy('opened_at', 'asc')
            .first()

        if(!next) {
            return {error: 'NOT_FOUND'}
        }

        next.user_id = auth.user?.id || 0
        await next.save()

        return next;

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
