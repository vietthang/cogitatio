import { Either, left, right } from 'fp-ts/lib/Either'
import { Resolve, Schema, SchemaLike } from './schema'

export interface ValidationErrorInit {
  message: string
  value: unknown
  paths: Array<string | number>
  rule?: string
  data?: unknown
}

export class ValidationError extends Error {
  public readonly value: unknown
  public readonly paths: Array<string | number>
  public readonly rule?: string
  public readonly data?: unknown

  constructor(init: ValidationErrorInit) {
    super(init.message)
    this.value = init.value
    this.paths = init.paths
    this.rule = init.rule
    this.data = init.data
  }
}

export interface Context {
  child(path: string | number): Context
  failure(params: Omit<ValidationErrorInit, 'paths'>): Validation<any>
}

export type EncodeFunction<T, O> = (
  context: Context,
  schema: Schema,
  value: T,
) => O

export type DecodeFunction<T, I> = (
  context: Context,
  schema: Schema,
  value: I,
) => Validation<T>

export type Validation<T> = Either<ValidationError[], T>

export const success = <T>(value: T): Validation<T> => right(value)

export const failure = (errors: ValidationError[]): Validation<any> =>
  left(errors)

export interface Encoder<O extends unknown> {
  encode<S extends SchemaLike>(schema: S, value: Resolve<S>): O
}

export interface Decoder<I extends unknown> {
  decode<S extends SchemaLike>(schema: S, value: I): Validation<Resolve<S>>
}

export interface Codec<I extends unknown, O extends unknown>
  extends Encoder<O>,
    Decoder<I> {}
