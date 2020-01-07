import { decorateProperty } from './metadata'
import { Constructor } from './object'
import { Resolve, SchemaLike } from './schema'

export type SafeDecorator<S extends SchemaLike> = <
  T extends Resolve<S> extends T[Key]
    ? T[Key] extends Resolve<S>
      ? {}
      : never
    : never,
  Key extends keyof T & string
>(
  target: T,
  key: Key,
) => void

export type Transformer<I, O> = (i: I) => O

export function Property<S extends SchemaLike>(
  schema: S,
  key?: string,
): SafeDecorator<S> {
  return <T extends {}>(target: T, property: string) => {
    decorateProperty<T>(target.constructor as Constructor<any>, {
      key: property,
      externalKey: key || property,
      schema,
    })
  }
}
