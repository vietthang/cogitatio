import {
  Constructor,
  Context,
  DictionarySchema,
  EnumSchema,
  ListSchema,
  NullableSchema,
  ObjectSchema,
  OptionalSchema,
  PrimitiveConstructor,
  PrimitiveSchema,
  Refine,
  RefineSchema,
  Resolve,
  SchemaLike,
  success,
  TaggedUnionSchema,
  TupleSchema,
  Validation,
} from '@cogitatio/core'

function identity<T>(_: Context, value: T) {
  return value
}

function inIntRange(value: bigint, bits: bigint, unsigned: boolean): boolean {
  if (unsigned) {
    return value >= BigInt(0) && value < BigInt(2) ** BigInt(bits)
  } else {
    return (
      value >= BigInt(0) - BigInt(2) ** BigInt(bits - BigInt(1)) &&
      value < BigInt(2) ** BigInt(bits - BigInt(1))
    )
  }
}

// Int8

export type Int8 = bigint & { int8: true }

function decodeInt8(context: Context, value: bigint): Validation<Int8> {
  if (!inIntRange(value, BigInt(8), false)) {
    return context.failure({
      message: 'invalid Int8 number',
      value,
      rule: 'Int8',
    })
  }
  return success(value as Int8)
}

export const Int8 = Refine<Int8, typeof BigInt>(BigInt, identity, decodeInt8)

// Uint8

export type Uint8 = bigint & { uint8: true }

function decodeUint8(context: Context, value: bigint): Validation<Uint8> {
  if (!inIntRange(value, BigInt(8), true)) {
    return context.failure({
      message: 'invalid Uint8 number',
      value,
      rule: 'Uint8',
    })
  }
  return success(value as Uint8)
}

export const Uint8 = Refine<Uint8, typeof BigInt>(BigInt, identity, decodeUint8)

// Int16

export type Int16 = bigint & { int16: true }

function decodeInt16(context: Context, value: bigint): Validation<Int16> {
  if (!inIntRange(value, BigInt(16), false)) {
    return context.failure({
      message: 'invalid Int16 number',
      value,
      rule: 'Int16',
    })
  }
  return success(value as Int16)
}

export const Int16 = Refine<Int16, typeof BigInt>(BigInt, identity, decodeInt16)

// Uint16

export type Uint16 = bigint & { uint16: true }

function decodeUint16(context: Context, value: bigint): Validation<Uint16> {
  if (!inIntRange(value, BigInt(16), true)) {
    return context.failure({
      message: 'invalid Uint16 number',
      value,
      rule: 'Uint16',
    })
  }
  return success(value as Uint16)
}

export const Uint16 = Refine<Uint16, typeof BigInt>(
  BigInt,
  identity,
  decodeUint16,
)

// Int32

export type Int32 = bigint & { int32: true }

function decodeInt32(context: Context, value: bigint): Validation<Int32> {
  if (!inIntRange(value, BigInt(32), false)) {
    return context.failure({
      message: 'invalid Int32 number',
      value,
      rule: 'Int32',
    })
  }
  return success(value as Int32)
}

export const Int32 = Refine<Int32, typeof BigInt>(BigInt, identity, decodeInt32)

// Uint32

export type Uint32 = bigint & { uint32: true }

function decodeUint32(context: Context, value: bigint): Validation<Uint32> {
  if (!inIntRange(value, BigInt(32), true)) {
    return context.failure({
      message: 'invalid Uint32 number',
      value,
      rule: 'Uint32',
    })
  }
  return success(value as Uint32)
}

export const Uint32 = Refine<Uint32, typeof BigInt>(
  BigInt,
  identity,
  decodeUint32,
)

// Int64

export type Int64 = bigint & { int64: true }

function decodeInt64(context: Context, value: bigint): Validation<Int64> {
  if (!inIntRange(value, BigInt(64), false)) {
    return context.failure({
      message: 'invalid Int64 number',
      value,
      rule: 'Int64',
    })
  }
  return success(value as Int64)
}

export const Int64 = Refine<Int64, typeof BigInt>(BigInt, identity, decodeInt64)

// Uint64

export type Uint64 = bigint & { uint64: true }

function decodeUint64(context: Context, value: bigint): Validation<Uint64> {
  if (!inIntRange(value, BigInt(64), true)) {
    return context.failure({
      message: 'invalid Uint64 number',
      value,
      rule: 'Uint64',
    })
  }
  return success(value as Uint64)
}

export const Uint64 = Refine<Uint64, typeof BigInt>(
  BigInt,
  identity,
  decodeUint64,
)
