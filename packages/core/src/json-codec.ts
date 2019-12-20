import { Temporal } from '@cogitatio/tc39-temporal'
import { Codec } from './codec'
import { SchemaType } from './common'
import { PrimitiveConstructor } from './primitive'
import { Resolve, resolveSchema, SchemaLike } from './schema'

export type JsonPrimitive = boolean | number | string | null | undefined

export type JsonArray = JsonValue[]

export interface JsonObject {
  [key: string]: JsonValue
}

export type JsonValue = JsonPrimitive | JsonArray | JsonObject

export function mapIndexed(
  value: object,
  mapFunction: (element: any, index: number | string) => any,
): any {
  if (value === null) {
    throw new Error('dont support null value')
  }
  if (Array.isArray(value)) {
    return value.map(mapFunction)
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, element]) => [
      key,
      mapFunction(element, key),
    ]),
  )
}

export class JsonCodec implements Codec<JsonValue, JsonValue> {
  public encode<S extends SchemaLike>(
    schemaLike: S,
    value: Resolve<S>,
  ): JsonValue {
    const schema = resolveSchema(schemaLike)

    switch (schema.type) {
      case SchemaType.Any:
        return value

      case SchemaType.Primitive:
        return this.encodePrimitive(schema.native, value)

      case SchemaType.Enum:
        return value

      case SchemaType.Optional:
        return value === undefined
          ? undefined
          : this.encode(schema.childSchema, value)

      case SchemaType.Nullable:
        return value === null ? null : this.encode(schema.childSchema, value)

      case SchemaType.List:
        return (value as any[]).map(element =>
          this.encode(schema.childSchema, element),
        )

      case SchemaType.Dictionary:
        return mapIndexed(value, element =>
          this.encode(schema.childSchema, element),
        )

      case SchemaType.Tuple:
        return (value as any[]).map((element, i) =>
          this.encode(schema.childSchemas[i], element),
        )

      case SchemaType.Object:
        return mapIndexed(schema.fields, (resolve, key) =>
          this.encode(resolve(), (value as any)[key]),
        )

      case SchemaType.Refinement:
        return schema.encode(this.encode(schema.baseSchema, value))

      case SchemaType.TaggedUnion:
        return {
          type: value.type,
          [value.type]: this.encode(
            schema.schemaMap[value.type],
            value[value.type],
          ),
        }

      default:
        throw new Error('unsupported')
    }
  }

  public decode<S extends SchemaLike>(
    schemaLike: S,
    value: JsonValue,
  ): Resolve<S> {
    const schema = resolveSchema(schemaLike)

    switch (schema.type) {
      case SchemaType.Any:
        return value as any

      case SchemaType.Primitive:
        return this.decodePrimitive(schema.native, value)

      case SchemaType.Enum:
        if (Object.values(schema.enumValues).includes(value)) {
          return value as any
        }

        throw new Error('invalid value for Enum')
      case SchemaType.Optional:
        return value === undefined
          ? undefined
          : this.decode(schema.childSchema, value)

      case SchemaType.Nullable:
        return value === null ? null : this.decode(schema.childSchema, value)

      case SchemaType.List:
        return (Array.isArray(value) ? value : [value]).map(element =>
          this.decode(schema.childSchema, element),
        ) as any

      case SchemaType.Dictionary:
        switch (typeof value) {
          case 'boolean':
          case 'bigint':
          case 'string':
          case 'number':
            throw new Error('invalid value for Dictionary')
        }
        if (!value) {
          throw new Error('invalid value for Dictionary')
        }
        if (Array.isArray(value)) {
          throw new Error('invalid value for Dictionary')
        }
        return mapIndexed(value, element =>
          this.decode(schema.childSchema, element),
        )

      case SchemaType.Tuple:
        if (!Array.isArray(value)) {
          throw new Error('invalid value for tuple')
        }

        if (value.length !== schema.childSchemas.length) {
          throw new Error('invalid length for tuple')
        }

        return value.map((element, i) =>
          this.decode(schema.childSchemas[i], element),
        ) as any

      case SchemaType.Object:
        switch (typeof value) {
          case 'boolean':
          case 'bigint':
          case 'string':
          case 'number':
            throw new Error('invalid value for Object')
        }
        if (!value) {
          throw new Error('invalid value for Object')
        }
        return mapIndexed(schema.fields, (resolve, key) =>
          this.decode(resolve(), (value as any)[key]),
        )

      case SchemaType.Refinement:
        return schema.decode(this.decode(schema.baseSchema, value))

      case SchemaType.TaggedUnion: {
        switch (typeof value) {
          case 'boolean':
          case 'bigint':
          case 'string':
          case 'number':
            throw new Error('invalid value for TaggedUnion')
        }
        if (!value) {
          throw new Error('invalid value for TaggedUnion')
        }
        if (Array.isArray(value)) {
          throw new Error('invalid value for TaggedUnion')
        }
        const type = value.type
        if (typeof type !== 'string') {
          throw new Error('invalid value for TaggedUnion')
        }
        return {
          type,
          [type]: this.decode(schema.schemaMap[type], value[type]),
        } as any
      }

      default:
        throw new Error('unsupported')
    }
  }
  private encodePrimitive(
    nativeConstructor: PrimitiveConstructor,
    value: any,
  ): JsonValue {
    switch (nativeConstructor) {
      case Boolean:
      case Number:
      case String:
        return value
      case BigInt:
        return (value as bigint).toString(10)
      case Date:
        return (value as Date).toISOString()
      case ArrayBuffer:
        return Buffer.from(value as ArrayBuffer).toString('base64')
      case Buffer:
        return (value as Buffer).toString('base64')
      case RegExp:
        return (value as RegExp).toString()
      case URL:
        return (value as URL).href
      case Temporal.Absolute:
        return (value as Temporal.Absolute).toString()
      case Temporal.Date:
        return (value as Temporal.Date).toString()
      case Temporal.Time:
        return (value as Temporal.Time).toString()
      case Temporal.DateTime:
        return (value as Temporal.DateTime).toString()
      case Temporal.Duration:
        return (value as Temporal.Duration).toString()
      default:
        throw new Error('invalid native constructor')
    }
  }

  private decodePrimitive(
    nativeConstructor: PrimitiveConstructor,
    value: JsonValue,
  ): any {
    switch (nativeConstructor) {
      case Boolean:
        if (typeof value === 'boolean') {
          return value
        }
        // tslint:disable-next-line:valid-typeof
        if (typeof value === 'number' || typeof value === 'bigint') {
          return Boolean(value)
        }
        if (typeof value === 'string') {
          switch (value) {
            case 'true':
            case '1':
            case 'yes':
            case 'on':
              return true
            case 'false':
            case '0':
            case 'no':
            case 'off':
              return false
          }
        }

        throw new Error('invalid value for boolean')
      case Number:
        switch (typeof value) {
          case 'boolean':
          case 'bigint':
          case 'string': {
            const numberValue = Number(value)
            if (isNaN(numberValue)) {
              throw new Error('invalid value for number')
            }
            return numberValue
          }
          case 'number':
            return value
        }

        throw new Error('invalid value for number')
      case String:
        switch (typeof value) {
          case 'boolean':
          case 'number':
          case 'bigint':
            return String(value)
          case 'string':
            return value
        }

        throw new Error('invalid value for string')
      case BigInt:
        switch (typeof value) {
          case 'boolean':
          case 'number':
          case 'string':
            return BigInt(value)
          case 'bigint':
            return value
        }

        throw new Error('invalid value for bigint')
      case Date:
        switch (typeof value) {
          case 'number':
          case 'bigint':
          case 'string': {
            const dateValue = new Date(value)
            if (isNaN(dateValue.getTime())) {
              throw new Error('invalid value for Date')
            }
            return dateValue
          }
        }

        throw new Error('invalid value for Date')
      case ArrayBuffer:
        switch (typeof value) {
          case 'string':
            return Buffer.from(value, 'base64').buffer
        }

        throw new Error('invalid value for ArrayBuffer')
      case Int8Array:
        switch (typeof value) {
          case 'string':
            return new Int8Array(Buffer.from(value, 'base64').buffer)
        }

        throw new Error('invalid value for Int8Array')
      case Uint8Array:
        switch (typeof value) {
          case 'string':
            return new Uint8Array(Buffer.from(value, 'base64').buffer)
        }

        throw new Error('invalid value for Uint8Array')
      case Uint8ClampedArray:
        switch (typeof value) {
          case 'string':
            return new Uint8ClampedArray(Buffer.from(value, 'base64').buffer)
        }

        throw new Error('invalid value for Uint8ClampedArray')
      case Int16Array:
        switch (typeof value) {
          case 'string':
            return new Int16Array(Buffer.from(value, 'base64').buffer)
        }

        throw new Error('invalid value for Int16Array')
      case Uint16Array:
        switch (typeof value) {
          case 'string':
            return new Uint16Array(Buffer.from(value, 'base64').buffer)
        }

        throw new Error('invalid value for Uint16Array')
      case Int32Array:
        switch (typeof value) {
          case 'string':
            return new Int32Array(Buffer.from(value, 'base64').buffer)
        }

        throw new Error('invalid value for Int32Array')
      case Uint32Array:
        switch (typeof value) {
          case 'string':
            return new Uint32Array(Buffer.from(value, 'base64').buffer)
        }

        throw new Error('invalid value for Uint32Array')
      case Float32Array:
        switch (typeof value) {
          case 'string':
            return new Float32Array(Buffer.from(value, 'base64').buffer)
        }

        throw new Error('invalid value for Float32Array')
      case Float64Array:
        switch (typeof value) {
          case 'string':
            return new Float64Array(Buffer.from(value, 'base64').buffer)
        }

        throw new Error('invalid value for Float64Array')
      case BigInt64Array:
        switch (typeof value) {
          case 'string':
            return new BigInt64Array(Buffer.from(value, 'base64').buffer)
        }

        throw new Error('invalid value for BigInt64Array')
      case BigUint64Array:
        switch (typeof value) {
          case 'string':
            return new BigUint64Array(Buffer.from(value, 'base64').buffer)
        }

        throw new Error('invalid value for BigUint64Array')
      case Buffer:
        switch (typeof value) {
          case 'string':
            return Buffer.from(value, 'base64')
        }

        throw new Error('invalid value for Buffer')
      case RegExp:
        switch (typeof value) {
          case 'string':
            return new RegExp(value)
        }

        throw new Error('invalid value for Regex')
      case URL:
        switch (typeof value) {
          case 'string':
            return new URL(value)
        }

        throw new Error('invalid value for URL')
      case Temporal.Absolute:
        switch (typeof value) {
          case 'number':
          case 'bigint':
            return Temporal.Absolute.fromEpochMilliseconds(value)
          case 'string':
            return Temporal.Absolute.from(value)
        }

        if (value instanceof Date) {
          return Temporal.Absolute.fromEpochMilliseconds(value.getTime())
        }

        if (value instanceof Temporal.Absolute) {
          return value
        }

        throw new Error('invalid value for Temporal.Absolute')
      case Temporal.Date:
        switch (typeof value) {
          case 'string':
            return Temporal.Date.from(value)
        }

        if (value instanceof Temporal.Date) {
          return value
        }

        throw new Error('invalid value for Temporal.Date')
      case Temporal.Time:
        switch (typeof value) {
          case 'string':
            return Temporal.Time.from(value)
        }

        if (value instanceof Temporal.Time) {
          return value
        }

        throw new Error('invalid value for Temporal.Time')
      case Temporal.DateTime:
        switch (typeof value) {
          case 'string':
            return Temporal.DateTime.from(value)
        }

        if (value instanceof Temporal.DateTime) {
          return value
        }

        throw new Error('invalid value for Temporal.DateTime')
      case Temporal.Duration:
        switch (typeof value) {
          case 'number':
          case 'bigint':
            return Temporal.Duration.from(`PT${Number(value)}MS`)
          case 'string':
            return Temporal.Duration.from(value)
        }

        if (value instanceof Temporal.Duration) {
          return value
        }

        throw new Error('invalid value for Temporal.Duration')
      default:
        throw new Error('invalid primitive type')
    }
  }
}
