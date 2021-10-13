import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UpdateSuporteTables extends BaseSchema {
  protected tableName = 'suportes'

  public async up () {
    this.schema.dropTableIfExists('chats')
    this.schema.table(this.tableName, (table) => {
      table.integer('user_id')
      table.dateTime('closed_at')
      table.dateTime('opened_at')
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('user_id')
      table.dropColumn('closed_at')
      table.dropColumn('opened_at')
    })
  }
}
