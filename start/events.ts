import Event from '@ioc:Adonis/Core/Event'
import Socket from '@ioc:App/Socket'

// Event.on('whatsapp:MESSAGE_RECEIVED', 'Whatsapp.onNewMessage')
Event.on('whatsapp:MESSAGE_CREATE', 'WhatsappListener.onNewMessage')
Event.on('whatsapp:MESSAGE_ACK', 'WhatsappListener.onAck')
Event.on('whatsapp:QR_RECEIVED', qr => {
    Socket.emit('qr', qr)
})

Event.on('whatsapp:AUTHENTICATED', session => {
    Socket.emit('auth', session)
})

Event.on('whatsapp:READY', 'WhatsappListener.onReady')

