import { IBaseSchema, SchemaType } from './common'

export interface IEnumSchema<T extends {} = {}> extends IBaseSchema<T> {
  type: SchemaType.Enum
  enumValues: T
}

export function Enum<T extends {} = {}>(values: T): IEnumSchema<T> {
  return {
    type: SchemaType.Enum,
    enumValues: values,
  } as IEnumSchema<T>
}
