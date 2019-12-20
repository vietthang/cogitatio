import { Resolve, SchemaLike } from './schema'

export interface Encoder<O extends unknown> {
  encode<S extends SchemaLike>(schema: S, value: Resolve<S>): O
}

export interface Decoder<I extends unknown> {
  decode<S extends SchemaLike>(schema: S, value: I): Resolve<S>
}

export interface Codec<I extends unknown, O extends unknown>
  extends Encoder<O>,
    Decoder<I> {}

export function composeDecoder<I>(
  baseDecoder: Decoder<I>,
  ...others: Array<Decoder<unknown>>
): Decoder<I> {
  return {
    decode: <S extends SchemaLike>(schema: S, value: I): Resolve<S> => {
      return others.reduce((prev, decoder) => {
        return decoder.decode(schema, prev)
      }, baseDecoder.decode(schema, value))
    },
  }
}
