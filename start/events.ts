import Event from '@ioc:Adonis/Core/Event'

Event.on('whatsapp:MESSAGE_RECEIVED', 'Whatsapp.onNewMessage')