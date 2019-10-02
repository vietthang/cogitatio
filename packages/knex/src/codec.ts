import {
  PrimitiveSchema,
  Resolve,
  SchemaLike,
  SchemaType,
  resolveSchema,
} from '@cogitatio/core'
import { Encoder } from '@cogitatio/extra'

export type SqlPrimitive = boolean | number | string | Date | Buffer | null

export type SqlValue = SqlPrimitive | Array<SqlValue>

export class SqlEncoder implements Encoder<SqlValue> {
  public encode<S extends SchemaLike>(
    schemaLike: S,
    value: Resolve<S>,
  ): SqlValue {
    const schema = resolveSchema(schemaLike)

    switch (schema.type) {
      case SchemaType.Primitive:
        return this.encodePrimitive(schema, value)

      case SchemaType.Enum:
        return value as string | number

      case SchemaType.Optional:
        return value === undefined
          ? null
          : this.encode(schema.childSchema, value)

      case SchemaType.Nullable:
        return value === null ? null : this.encode(schema.childSchema, value)

      case SchemaType.List:
        return (value as any[]).map(value =>
          this.encode(schema.childSchema, value),
        )

      case SchemaType.Tuple:
        return schema.childSchemas.map((childSchema, index) =>
          this.encode(childSchema, value[index]),
        )

      case SchemaType.Brand:
        return this.encode(schema.childSchema, value)

      case SchemaType.Any:
        return value

      case SchemaType.Object:
        throw new Error('object is not supported yet')

      default:
        throw new Error('unsupported schema type')
    }
  }

  private encodePrimitive<S extends PrimitiveSchema>(
    schema: S,
    value: Resolve<S>,
  ): SqlValue {
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
        return value as Date
      case ArrayBuffer:
        return value as Buffer
      case Buffer:
        return value as Buffer
      case RegExp:
        return value.toString()
      default:
        throw new Error('invalid primitive type')
    }
  }
}
