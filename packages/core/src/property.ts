import { decorateClass } from './metadata'
import { Resolve, Schema, SchemaLike, resolveSchema } from './schema'

export interface SafeDecorator<S extends SchemaLike> {
  readonly schema: () => Schema
  <
    T extends Resolve<S> extends T[Key]
      ? (T[Key] extends Resolve<S> ? {} : never)
      : never,
    Key extends keyof T
  >(
    target: T,
    key: Key,
  ): void
}

export type Transformer<I, O> = (i: I) => O

export function Property<S extends SchemaLike>(schema: S): SafeDecorator<S>

export function Property<S extends SchemaLike, S0 extends SchemaLike>(
  schema: S,
  t0: Transformer<S, S0>,
): SafeDecorator<S0>

export function Property<
  S extends SchemaLike,
  S0 extends SchemaLike,
  S1 extends SchemaLike
>(schema: S, t0: Transformer<S, S0>, t1: Transformer<S0, S1>): SafeDecorator<S1>

export function Property<
  S extends SchemaLike,
  S0 extends SchemaLike,
  S1 extends SchemaLike,
  S2 extends SchemaLike
>(
  schema: S,
  t0: Transformer<S, S0>,
  t1: Transformer<S0, S1>,
  t2: Transformer<S1, S2>,
): SafeDecorator<S2>

export function Property<
  S extends SchemaLike,
  S0 extends SchemaLike,
  S1 extends SchemaLike,
  S2 extends SchemaLike,
  S3 extends SchemaLike
>(
  schema: S,
  t0: Transformer<S, S0>,
  t1: Transformer<S0, S1>,
  t2: Transformer<S1, S2>,
  t3: Transformer<S2, S3>,
): SafeDecorator<S3>

export function Property<
  S extends SchemaLike,
  S0 extends SchemaLike,
  S1 extends SchemaLike,
  S2 extends SchemaLike,
  S3 extends SchemaLike,
  S4 extends SchemaLike
>(
  schema: S,
  t0: Transformer<S, S0>,
  t1: Transformer<S0, S1>,
  t2: Transformer<S1, S2>,
  t3: Transformer<S2, S3>,
  t4: Transformer<S3, S4>,
): SafeDecorator<S4>

export function Property<
  S extends SchemaLike,
  S0 extends SchemaLike,
  S1 extends SchemaLike,
  S2 extends SchemaLike,
  S3 extends SchemaLike,
  S4 extends SchemaLike,
  S5 extends SchemaLike
>(
  schema: S,
  t0: Transformer<S, S0>,
  t1: Transformer<S0, S1>,
  t2: Transformer<S1, S2>,
  t3: Transformer<S2, S3>,
  t4: Transformer<S3, S4>,
  t5: Transformer<S4, S5>,
): SafeDecorator<S5>

export function Property(
  schema: SchemaLike,
  ...transformers: Array<Transformer<SchemaLike, SchemaLike>>
): SafeDecorator<any> {
  const resolver = (): Schema =>
    resolveSchema(transformers.reduce((s, t) => t(s), schema))

  return Object.assign(
    <T extends {}>(target: T, key: keyof T) => {
      decorateClass<T, keyof T>(target.constructor as any, key, resolver)
    },
    { schema: resolver },
  )
}
