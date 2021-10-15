import Event from '@ioc:Adonis/Core/Event'

// Event.on('whatsapp:MESSAGE_RECEIVED', 'Whatsapp.onNewMessage')
Event.on('whatsapp:MESSAGE_CREATE', 'WhatsappListener.onNewMessage')
Event.on('whatsapp:MESSAGE_ACK', 'WhatsappListener.onAck')
