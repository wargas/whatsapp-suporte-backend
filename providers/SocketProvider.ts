import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { Server } from 'socket.io'

export default class SocketProvider {

  server: Server;

  constructor (protected app: ApplicationContract) {
  }

  public register () {
    // Register your own bindings
    this.server = new Server({
      cors: {
        origin: '*'
      }
    })
  }

  public async boot () {
    // All bindings are ready, feel free to use them
  }

  public async ready () {
    // App is ready
    const AdonisServer = this.app.container.use('Adonis/Core/Server')
    this.server.attach(AdonisServer.instance!)

    this.server.on('connection', socket => {
      this.app.logger.info(`Connected: ${socket.id}`)
    })

  }

  public async shutdown () {
    // Cleanup, since app is going down
  }
}
