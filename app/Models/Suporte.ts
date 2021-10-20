import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Suporte extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public pushname: string

  @column()
  public image_url: string

  @column()
  public contact_id: string

  @column()
  public chat_id: string

  @column()
  public status: string

  @column()
  public setor: string

  @column.dateTime()
  public openedAt: DateTime

  @column.dateTime()
  public closedAt: DateTime

  @column()
  public user_id: Number
  
  @column()
  public unreads: Number


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
