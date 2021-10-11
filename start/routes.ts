import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('login', 'AuthController.login')
  Route.get('me', 'AuthController.currentUser').middleware('auth')
}).prefix('api/v1/auth')

Route.group(() => {
  Route.get('/suportes', 'SuportesController.index')
  Route.get('/suportes/:id', 'SuportesController.show')
  Route.get('/suportes/:id/messages', 'SuportesController.getMessages')
  Route.post('/suportes/:id/send', 'SuportesController.sendMessage')
}).prefix('api/v1').middleware('auth')

Route.get('/', async () => {
  return { suporte: 'v1' }
})
