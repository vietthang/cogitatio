import { decorateClass } from './metadata'
import { Resolve, resolveSchema, Schema, SchemaLike } from './schema'

export interface SafeDecorator<S extends SchemaLike> {
  readonly schema: () => Schema
  <
    T extends Resolve<S> extends T[Key]
      ? T[Key] extends Resolve<S>
        ? {}
        : never
      : never,
    Key extends keyof T
  >(
    target: T,
    key: Key,
  ): void
}

export type Transformer<I, O> = (i: I) => O

export function Property<S extends SchemaLike>(schema: S): SafeDecorator<S>

export function Property(schema: SchemaLike): SafeDecorator<any> {
  const resolver = () => resolveSchema(schema)

  return Object.assign(
    <T extends {}>(target: T, key: keyof T) => {
      decorateClass<T, keyof T>(target.constructor as any, key, resolver)
    },
    { schema: resolver },
  )
}
