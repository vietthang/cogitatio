import { IBaseSchema, SchemaType } from './common'
import { Property } from './property'

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

export function Enum<T extends {} = {}>(
  values: T,
): IEnumSchema<T> & EnumDecorator<IEnumSchema<T>> {
  const schema: IEnumSchema<T> = {
    type: SchemaType.Enum,
    enumValues: values,
    get _(): any {
      return undefined
    },
  }
  return Object.assign((target: any, key: any) => {
    Property(schema)(target, key)
  }, schema)
}
