import { IBaseSchema, SchemaType } from './common'

export type Constructor<T extends object = object> = new (...args: any[]) => T

export interface IObjectSchema<T extends object = object>
  extends IBaseSchema<T> {
  type: SchemaType.Object
  fields: () => { [key in keyof T]: IBaseSchema<T[key]> }
}
