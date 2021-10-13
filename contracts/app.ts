
declare module '@ioc:App/Whatsapp' {
    import { WhatsappService } from 'App/Services/Whatsapp';

    const Whatsapp: WhatsappService;
    export default Whatsapp
}

declare module '@ioc:App/Socket' {
    import { Server } from 'socket.io'

    const Socket: Server

    export default Socket
}