import {
  IObjectSchema,
  IPrimitiveSchema,
  Primitive,
  reflectClass,
  Resolve,
  resolveSchema,
  Schema,
  SchemaLike,
  SchemaType,
} from '@cogitatio/core'
import { ICodec } from '@cogitatio/extra'
import { decode, encode } from 'base64-arraybuffer'
import { JsonValue } from './types'

export class JsonCodec implements ICodec<JsonValue, JsonValue> {
  public encode(schemaLike: SchemaLike) {
    const schema = resolveSchema(schemaLike)

    return (value: Resolve<Schema>): JsonValue => {
      switch (schema.type) {
        case SchemaType.Primitive:
          return this.encodePrimitive(schema, value)

        case SchemaType.Enum:
          return value as string | number

        case SchemaType.Optional:
          return value === undefined
            ? undefined
            : this.encode(schema.childSchema)(value)

        case SchemaType.Nullable:
          return value === null ? null : this.encode(schema.childSchema)(value)

        case SchemaType.List:
          return (value as any[]).map(value =>
            this.encode(schema.childSchema)(value),
          )

        case SchemaType.Tuple:
          return schema.childSchemas.map((childSchema, index) =>
            this.encode(childSchema)(value[index]),
          )

        case SchemaType.Object:
          return this.encodeObject(schema, value)

        default:
          throw new Error('unsupported schema type')
      }
    }
  }

  public decode(schemaLike: SchemaLike) {
    const schema = resolveSchema(schemaLike)

    return (value: JsonValue): any => {
      switch (schema.type) {
        case SchemaType.Primitive:
          return this.decodePrimitive(schema, value)

        case SchemaType.Enum:
          if (Object.values(schema.enumValues).includes(value as any)) {
            return value
          }
          throw new Error('invalid enum value')

        case SchemaType.Optional:
          return value === undefined
            ? undefined
            : this.decode(schema.childSchema)(value)

        case SchemaType.Nullable:
          return value === null ? null : this.decode(schema.childSchema)(value)

        case SchemaType.List:
          if (Array.isArray(value)) {
            return value.map(value => this.decode(schema.childSchema)(value))
          }
          throw new Error('invalid value')

        case SchemaType.Tuple:
          if (
            Array.isArray(value) &&
            value.length === schema.childSchemas.length
          ) {
            return value.map((value, index) =>
              this.decode(schema.childSchemas[index])(value),
            )
          }
          throw new Error('invalid value')

        case SchemaType.Object:
          return this.decodeObject(schema, value)

        default:
          throw new Error('unsupported schema type')
      }
    }
  }

  private encodeObject(schema: IObjectSchema, value: unknown): JsonValue {
    if (typeof value !== 'object' || value === null) {
      throw new Error('invalid value type')
    }
    return Object.fromEntries(
      Object.entries(schema.fields()).map(([key, schema]) => {
        return [key, this.encode(schema as any)(value)]
      }),
    )
  }

  private decodeObject(schema: IObjectSchema, value: JsonValue): unknown {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error('invalid value type')
    }
    return Object.fromEntries(
      Object.entries(schema.fields()).map(([key, schema]) => {
        return [key, this.decode(schema as any)(value)]
      }),
    )
  }

  private encodePrimitive(schema: IPrimitiveSchema, value: unknown): JsonValue {
    switch (schema.native) {
      case Boolean:
        return value as boolean
      case Number:
        return value as number
      case String:
        return value as string
      case BigInt:
        return (value as bigint).toString()
      case Date:
        return (value as Date).toISOString()
      case ArrayBuffer:
        return encode(value as ArrayBuffer)
      case Buffer:
        return encode(value as Buffer)
      default:
        throw new Error('invalid primitive type')
    }
  }

  private decodePrimitive(
    schema: IPrimitiveSchema,
    value: JsonValue,
  ): Primitive {
    switch (schema.native) {
      case Boolean:
        if (typeof value === 'boolean') {
          return value
        }
        throw new Error('invalid value type')
      case Number:
        if (typeof value === 'number') {
          return value
        }
        throw new Error('invalid value type')
      case String:
        if (typeof value === 'string') {
          return value
        }
        throw new Error('invalid value type')
      case BigInt:
        if (typeof value === 'string' || typeof value === 'number') {
          return BigInt(value)
        }
        throw new Error('invalid value type')
      case Date:
        if (typeof value === 'string' || typeof value === 'number') {
          return new Date(value)
        }
        throw new Error('invalid value type')
      case ArrayBuffer:
        if (typeof value === 'string') {
          return decode(value)
        }
        throw new Error('invalid value type')
      case Buffer:
        if (typeof value === 'string') {
          return Buffer.from(decode(value))
        }
        throw new Error('invalid value type')
      default:
        throw new Error('invalid primitive type')
    }
  }
}
