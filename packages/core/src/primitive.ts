import { Temporal } from '@cogitatio/tc39-temporal'
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
  | typeof Temporal.Absolute
  | typeof Temporal.Date
  | typeof Temporal.Time
  | typeof Temporal.DateTime
  | typeof Temporal.Duration

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
    case Temporal.Absolute:
    case Temporal.Date:
    case Temporal.Time:
    case Temporal.DateTime:
    case Temporal.Duration:
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
  : C extends typeof Temporal.Absolute
  ? Temporal.Absolute
  : C extends typeof Temporal.Date
  ? Temporal.Date
  : C extends typeof Temporal.Time
  ? Temporal.Time
  : C extends typeof Temporal.DateTime
  ? Temporal.DateTime
  : C extends typeof Temporal.Duration
  ? Temporal.Duration
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
    : C extends typeof Temporal.Absolute
    ? Temporal.Absolute
    : C extends typeof Temporal.Date
    ? Temporal.Date
    : C extends typeof Temporal.Time
    ? Temporal.Time
    : C extends typeof Temporal.DateTime
    ? Temporal.DateTime
    : C extends typeof Temporal.Duration
    ? Temporal.Duration
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
  | Temporal.Absolute
  | Temporal.Date
  | Temporal.Time
  | Temporal.DateTime
  | Temporal.Duration

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
  : T extends Temporal.Absolute
  ? typeof Temporal.Absolute
  : T extends Temporal.Date
  ? typeof Temporal.Date
  : T extends Temporal.Time
  ? typeof Temporal.Time
  : T extends Temporal.DateTime
  ? typeof Temporal.DateTime
  : T extends Temporal.Duration
  ? typeof Temporal.Duration
  : never
