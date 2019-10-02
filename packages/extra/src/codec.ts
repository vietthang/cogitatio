import { Resolve, SchemaLike } from '@cogitatio/core'

export interface Encoder<O extends unknown> {
  encode<S extends SchemaLike>(schema: S, value: Resolve<S>): O
}

export interface Decoder<I extends unknown> {
  decode<S extends SchemaLike>(schema: S, value: I): Resolve<S>
}

export interface Codec<I extends unknown, O extends unknown>
  extends Encoder<O>,
    Decoder<I> {}
