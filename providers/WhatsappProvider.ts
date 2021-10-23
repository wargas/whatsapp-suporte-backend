import Application from '@ioc:Adonis/Core/Application'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { WhatsappService } from 'App/Services/WhatsappService'


export default class WhatsappProvider {

  public Service: WhatsappService

  constructor (protected app: ApplicationContract) {
  }

  public register () {
    
    this.app.container.singleton('App/Whatsapp', () => {
      return this.Service = new WhatsappService(this.app)
    })
  }

  public async boot () {
    // All bindings are ready, feel free to use them
  }

  public async ready () {
    if(Application.environment !== 'web') {
      return;
    }
    this.app.container.use('App/Socket').emit('status', 'PENDENTE')
    await this.app.container.use('App/Whatsapp').start()
  }

  public async shutdown () {
    // Cleanup, since app is going down
  }
}
