import { Temporal } from '@cogitatio/tc39-temporal'
import { BaseSchema, SchemaType } from './common'

export type PrimitiveConstructor =
  | typeof Boolean
  | typeof Number
  | typeof String
  | typeof BigInt
  | typeof Date
  | typeof ArrayBuffer
  | typeof Int8Array
  | typeof Uint8Array
  | typeof Uint8ClampedArray
  | typeof Int16Array
  | typeof Uint16Array
  | typeof Int32Array
  | typeof Uint32Array
  | typeof Float32Array
  | typeof Float64Array
  | typeof BigInt64Array
  | typeof BigUint64Array
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
    case Int8Array:
    case Uint8Array:
    case Uint8ClampedArray:
    case Int16Array:
    case Uint16Array:
    case Int32Array:
    case Uint32Array:
    case Float32Array:
    case Float64Array:
    case BigInt64Array:
    case BigUint64Array:
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
  : C extends typeof Int8Array
  ? Int8Array
  : C extends typeof Uint8Array
  ? Uint8Array
  : C extends typeof Uint8ClampedArray
  ? Uint8ClampedArray
  : C extends typeof Int16Array
  ? Int16Array
  : C extends typeof Uint16Array
  ? Uint16Array
  : C extends typeof Int32Array
  ? Int32Array
  : C extends typeof Uint32Array
  ? Uint32Array
  : C extends typeof Float32Array
  ? Float32Array
  : C extends typeof Float64Array
  ? Float64Array
  : C extends typeof BigInt64Array
  ? BigInt64Array
  : C extends typeof BigUint64Array
  ? BigUint64Array
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
