import { IBaseSchema, SchemaType } from './common'

export type Constructor<T extends {} = {}> = new (...args: any[]) => T

export interface IObjectSchema<T extends {} = {}> extends IBaseSchema {
  type: SchemaType.Object
  resolver: () => Constructor<T>
}

export type ResolveObject<S extends IObjectSchema> = S extends IObjectSchema<
  infer T
>
  ? T
  : never

export type ObjectDecorator<S extends IObjectSchema> = <
  T extends ResolveObject<S> extends T[Key]
    ? (T[Key] extends ResolveObject<S> ? {} : never)
    : never,
  Key extends keyof T
>(
  target: T,
  key: Key,
) => void

export function forward<T>(resolver: () => Constructor<T>): IObjectSchema<T> {
  return {
    type: SchemaType.Object,
    resolver,
  }
}
