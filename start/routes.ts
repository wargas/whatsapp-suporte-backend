import Socket from '@ioc:App/Socket'
import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('login', 'AuthController.login')
  Route.get('me', 'AuthController.currentUser').middleware('auth')
}).prefix('api/v1/auth')

Route.group(() => {
  Route.get('/suportes', 'SuportesController.index')
  Route.get('/suportes/user', 'SuportesController.userSuportes')
  Route.get('/suportes/next', 'SuportesController.getNextSuporte')
  Route.post('/suportes/:id/finalizar', 'SuportesController.finalizarSuporte')
  Route.get('/suportes/status', 'SuportesController.status')
  Route.get('/suportes/:id', 'SuportesController.show')
  Route.get('/suportes/:id/messages', 'SuportesController.getMessages')
  Route.post('/suportes/:id/send', 'SuportesController.sendMessage')
}).prefix('api/v1').middleware('auth')

Route.get('api/v1/media/:id', 'SuportesController.media')
Route.get('/', async () => {

  return { suporte: 'v1' }
})
