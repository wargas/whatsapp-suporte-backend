import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('login', 'AuthController.login')
  Route.get('me', 'AuthController.currentUser').middleware('auth')
}).prefix('api/v1/auth')
 
Route.group(() => {
  Route.get('/suportes', 'SuportesController.index').middleware('whatsapp')
  Route.get('/suportes/user', 'SuportesController.userSuportes').middleware('whatsapp')
  Route.get('/suportes/next', 'SuportesController.getNextSuporte').middleware('whatsapp')
  Route.get('/suportes/status', 'SuportesController.status')
  Route.post('/suportes/:id/finalizar', 'SuportesController.finalizarSuporte').middleware('whatsapp')
  Route.get('/suportes/:id/novo', 'SuportesController.novoSuporte').middleware('whatsapp')
  Route.get('/suportes/:id', 'SuportesController.show').middleware('whatsapp')
  Route.get('/suportes/:id/messages', 'SuportesController.getMessages').middleware('whatsapp')
  Route.post('/suportes/:id/send', 'SuportesController.sendMessage').middleware('whatsapp')
  Route.post('/suportes/:id/media', 'SuportesController.sendMedia').middleware('whatsapp')

  Route.get('/whatsapp/contacts', 'WhatsappsController.getContacts')
  Route.get('/whatsapp/chats', 'WhatsappsController.getChats')
  
}).prefix('api/v1').middleware('auth')

Route.get('api/v1/media/:id', 'SuportesController.media')
Route.get('/', async ({info}) => {

  return { info }
}).middleware('whatsapp')
