import { IBaseSchema, SchemaType } from './common'

export interface IEnumSchema<T extends {} = {}> extends IBaseSchema {
  type: SchemaType.Enum
  enumValues: T
  _: T
}

export type ResolveEnum<S extends IEnumSchema<{}>> = S extends IEnumSchema<
  infer T
>
  ? T[keyof T]
  : never

export type EnumDecorator<S extends IEnumSchema> = <
  T extends ResolveEnum<S> extends T[Key]
    ? (T[Key] extends ResolveEnum<S> ? {} : never)
    : never,
  Key extends keyof T
>(
  target: T,
  key: Key,
) => void

export function Enum<T extends {} = {}>(values: T): IEnumSchema<T> {
  return {
    type: SchemaType.Enum,
    enumValues: values,
  } as IEnumSchema<T>
}
