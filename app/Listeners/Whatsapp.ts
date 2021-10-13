// import { EventsList } from '@ioc:Adonis/Core/Event'
// import Chat from 'App/Models/Chat';
import Socket from '@ioc:App/Socket';
import Wpp from '@ioc:App/Whatsapp'
import Suporte from 'App/Models/Suporte';
import { Message } from 'whatsapp-web.js';

export default class Whatsapp {
    async onNewMessage(message: Message) {

        const contato = await Wpp.client.getContactById(message.from)
        const imageUrl = await contato.getProfilePicUrl()

        try {

            if(message.id._serialized === 'status@broadcast') {
                console.log('message from status')
                return ;
            }
            const chat = await Wpp.client.getChatById(message.from) 

            if(chat.isGroup) {
                console.log('message from group')  
                return;
            }

            const suporte = await Suporte.updateOrCreate({
                chat_id: message.from
            }, {
                name: contato.name, 
                pushname: contato.pushname,
                image_url: imageUrl,
                chat_id: message.from,
                contact_id: contato.id._serialized
            })
    
            Socket.emit('message', {...message, chat})
            
    
            console.log(suporte.id)

            
        } catch(error) {

            console.log(message.from)
            return;
        }
        

        
        
    }

    async onSendMessage(message: Message) {
        console.log(message)
        // Socket.emit('message', message)
    }
}
