import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { Connection, Channel, connect } from 'amqplib'
import Env from '@ioc:Adonis/Core/Env'

export class RabbitService {
    connection: Connection
    channel: Channel
    #app: ApplicationContract

    constructor(app: ApplicationContract) {
        this.#app = app;
    }

    async start() {
        try {
            this.connection = await connect({
                vhost: Env.get('AMQP_VHOST', '/'),
                hostname: Env.get('AMQP_HOST'),
                username: Env.get('AMQP_USER'),
                password: Env.get('AMQP_PASSWORD')
                
            })

            this.channel = await this.connection.createChannel()

            await this.assertQueues()
            this.#app.logger.info('Habbit conectado')

        } catch(error) {
            this.#app.logger.error('Erro ao connectar ao Habbit')
        }
    }

    async assertQueues() {
       await this.channel.assertQueue('new-message')
       await this.channel.assertQueue('new-ack')
       await this.channel.assertQueue('insert-suporte')
       await this.channel.assertQueue('update-count-fila')
    }

}