import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Whatsapp from '@ioc:App/Whatsapp'


export default class WhatsappMiddleware {
  public async handle (ctx: HttpContextContract, next: () => Promise<void>) {
    try {
      const info = await Whatsapp.client.info

      ctx.info = info

      if(!info) {
        return ctx.response.status(505).json({error: 'WHATSAPP_DESCONECTADO'})
      } 
      
      await next()

    } catch (error) {
      return ctx.response.status(505).json({error: 'WHATSAPP_DESCONECTADO'})
    }
    
  }
}
