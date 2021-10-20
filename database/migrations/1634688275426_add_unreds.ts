import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Suportes extends BaseSchema {
  protected tableName = 'suportes'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('unreads').defaultTo(0)
    })
  }
 
  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('unreads')
    })
  }
}
