import Application from '@ioc:Adonis/Core/Application';
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { RabbitService } from 'App/Services/RabbitService'
/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
|
| Your application is not ready when this file is loaded by the framework.
| Hence, the top level imports relying on the IoC container will not work.
| You must import them inside the life-cycle methods defined inside
| the provider class.
|
| @example
|
| public async ready () {
|   const Database = this.app.container.resolveBinding('Adonis/Lucid/Database')
|   const Event = this.app.container.resolveBinding('Adonis/Core/Event')
|   Event.on('db:query', Database.prettyPrint)
| }
|
*/
export default class RabbitProvider {
  constructor (protected app: ApplicationContract) {
  }

  public register () {
    if(Application.environment !== 'web') {
      return;
    }
    // Register your own bindings
    this.app.container.singleton('App/Rabbit', () => {
      const Rabbit = new RabbitService(this.app) 
      
      return Rabbit
    })
  }

  public async boot () {
    if(Application.environment !== 'web') {
      return;
    }
    // All bindings are ready, feel free to use them
    const Rabbit = this.app.container.use('App/Rabbit')

    await Rabbit.start()
    
  }

  public async ready () {
    // App is ready 
    // const Rabbit = this.app.container.use('App/Rabbit').start()

    // await Rabbit.start()
  }

  public async shutdown () {
    // Cleanup, since app is going down
  }
}
