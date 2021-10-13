import Event from '@ioc:Adonis/Core/Event'

// Event.on('whatsapp:MESSAGE_RECEIVED', 'Whatsapp.onNewMessage')
Event.on('whatsapp:MESSAGE_CREATE', 'Whatsapp.onNewMessage')
