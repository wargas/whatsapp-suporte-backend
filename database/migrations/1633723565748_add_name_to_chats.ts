import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Chat extends BaseSchema {
  protected tableName = 'chats'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('name')
      table.string('chat_id')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {  
      table.dropColumns('name', 'chat_id')
    })
  }
}
