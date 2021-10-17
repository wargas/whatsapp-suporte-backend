// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Whatsapp from "@ioc:App/Whatsapp";

export default class WhatsappsController {

    async getContacts() {
        return await Whatsapp.client.getContacts()
    }

    async getChats() { 
        return await Whatsapp.client.getChats()
    }

    
}
