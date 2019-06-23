import { Resolve, SchemaLike } from '@anzenjs/core'

export interface IEncoder<O extends unknown> {
  encode<S extends SchemaLike>(schema: S): (value: Resolve<S>) => O
}

export interface IDecoder<I extends unknown> {
  decode<S extends SchemaLike>(schema: S): (value: I) => Resolve<S>
}

export interface ICodec<I extends unknown, O extends unknown>
  extends IEncoder<O>,
    IDecoder<I> {}
