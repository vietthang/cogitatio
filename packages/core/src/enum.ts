import { BaseSchema, SchemaType } from './common'

export interface EnumSchema<T extends any = any>
  extends BaseSchema<T[keyof T]> {
  type: SchemaType.Enum
  enumValues: T
}

export function Enum<T extends { [key in keyof T]: string | number } = any>(
  values: T,
): EnumSchema<T> {
  return {
    type: SchemaType.Enum,
    enumValues: values,
  } as EnumSchema<T>
}
