import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { WhatsappService } from 'App/Services/Whatsapp'
import { Server, Socket } from 'socket.io'

export default class SocketProvider {

 

  constructor (protected app: ApplicationContract) {
  }

  public register () {
    // Register your own bindings
    this.app.container.singleton('App/Socket', () => {
     const server = new Server({
        cors: {
          origin: '*'
        }
      })

      return server
    })
    
  }

  public async boot () {
    // All bindings are ready, feel free to use them
  }

  public async ready () {
    // App is ready
    const AdonisServer = this.app.container.use('Adonis/Core/Server')
    const server = this.app.container.use('App/Socket')
    const WhatsApp: WhatsappService = this.app.container.use('App/Whatsapp')
    server.attach(AdonisServer.instance!)

    server.on('connection', (socket: Socket) => {
      this.app.logger.info(`Connected: ${socket.id} | ${WhatsApp.status}`)

      socket.broadcast.emit('status', 'READY')
    })

  }

  public async shutdown () {
    // Cleanup, since app is going down
  }
}
