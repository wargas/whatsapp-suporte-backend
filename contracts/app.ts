

declare module '@ioc:App/Whatsapp' {
    import { WhatsappService } from 'App/Services/WhatsappService';

    const Whatsapp: WhatsappService;
    export default Whatsapp
}

declare module '@ioc:App/Socket' {
    import { Server } from 'socket.io'

    const Socket: Server

    export default Socket
}

declare module '@ioc:Adonis/Core/HttpContext' {
    import { ClientInfo } from 'whatsapp-web';
    interface HttpContextContract {
        info: ClientInfo
    }
}