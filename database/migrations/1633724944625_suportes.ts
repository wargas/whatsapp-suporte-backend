import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Suportes extends BaseSchema {
  protected tableName = 'suportes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name')
      table.string('pushname')
      table.string('image_url')
      table.string('contact_id')
      table.string('chat_id')
      table.string('status')
      table.string('setor')
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
