import { BaseSchema, SchemaType } from './common'

export type PrimitiveConstructor =
  | typeof Boolean
  | typeof Number
  | typeof String
  | typeof BigInt
  | typeof Date
  | typeof ArrayBuffer
  | typeof Buffer
  | typeof RegExp
  | typeof URL

export function isPrimitiveConstructor(
  value: any,
): value is PrimitiveConstructor {
  switch (value) {
    case Boolean:
    case Number:
    case String:
    case BigInt:
    case Date:
    case ArrayBuffer:
    case Buffer:
    case RegExp:
    case URL:
      return true
    default:
      return false
  }
}

export interface PrimitiveSchema<
  C extends PrimitiveConstructor = PrimitiveConstructor
> extends BaseSchema<ResolvePrimitiveFromConstructor<C>> {
  type: SchemaType.Primitive
  native: C
}

export type ResolvePrimitiveFromConstructor<
  C extends PrimitiveConstructor
> = C extends typeof Boolean
  ? boolean
  : C extends typeof Number
  ? number
  : C extends typeof String
  ? string
  : C extends typeof BigInt
  ? bigint
  : C extends typeof Date
  ? Date
  : C extends typeof ArrayBuffer
  ? ArrayBuffer
  : C extends typeof Buffer
  ? Buffer
  : C extends typeof RegExp
  ? RegExp
  : C extends typeof URL
  ? URL
  : never

export type ResolvePrimitive<
  S extends PrimitiveSchema
> = S extends PrimitiveSchema<infer C>
  ? C extends typeof Boolean
    ? boolean
    : C extends typeof Number
    ? number
    : C extends typeof String
    ? string
    : C extends typeof BigInt
    ? bigint
    : C extends typeof Date
    ? Date
    : C extends typeof ArrayBuffer
    ? ArrayBuffer
    : C extends typeof Buffer
    ? Buffer
    : C extends typeof RegExp
    ? RegExp
    : C extends typeof URL
    ? URL
    : never
  : never

export type Primitive =
  | boolean
  | number
  | string
  | bigint
  | Date
  | ArrayBuffer
  | Buffer
  | RegExp
  | URL

export type ReverseResolvePrimitive<T extends Primitive> = T extends boolean
  ? typeof Boolean
  : T extends number
  ? typeof Number
  : T extends string
  ? typeof String
  : T extends bigint
  ? typeof BigInt
  : T extends Date
  ? typeof Date
  : T extends ArrayBuffer
  ? typeof ArrayBuffer
  : T extends Buffer
  ? typeof Buffer
  : T extends RegExp
  ? typeof RegExp
  : T extends URL
  ? typeof URL
  : never

export type PrimitiveDecorator<S extends PrimitiveSchema> = <
  T extends ResolvePrimitive<S> extends T[Key]
    ? T[Key] extends ResolvePrimitive<S>
      ? {}
      : never
    : never,
  Key extends keyof T
>(
  target: T,
  key: Key,
) => void
