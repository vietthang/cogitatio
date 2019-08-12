import { IBaseSchema, SchemaType } from './common'

export interface IEnumSchema<T extends any = any>
  extends IBaseSchema<T[keyof T]> {
  type: SchemaType.Enum
  enumValues: T
}

export function Enum<T extends any = any>(values: T): IEnumSchema<T> {
  return {
    type: SchemaType.Enum,
    enumValues: values,
  } as IEnumSchema<T>
}
