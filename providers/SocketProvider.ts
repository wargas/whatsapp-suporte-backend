import Application from '@ioc:Adonis/Core/Application'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { WhatsappService } from 'App/Services/WhatsappService'
import { Server, Socket } from 'socket.io'

export default class SocketProvider {


  public static needsApplication = true


  constructor(protected app: ApplicationContract) {
  }

  public register() {
    if(Application.environment !== 'web') {
      return;
    }
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

  public async boot() {
    // All bindings are ready, feel free to use them
  }

  public async ready() {
    if(Application.environment !== 'web') {
      return;
    }
    // App is ready
    const AdonisServer = this.app.container.use('Adonis/Core/Server')

    if (AdonisServer.instance) {
      const server = this.app.container.use('App/Socket')
      const WhatsApp: WhatsappService = this.app.container.use('App/Whatsapp')
      server.attach(AdonisServer.instance!)

      server.on('connection', (socket: Socket) => {
        this.app.logger.info(`Connected: ${socket.id} | ${WhatsApp.status}`)

        socket.broadcast.emit('status', 'READY')
      })
    }
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
