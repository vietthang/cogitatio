import { Temporal } from '@cogitatio/tc39-temporal'
import { either } from 'fp-ts'
import {
  Codec,
  Context,
  DecodeFunction,
  EncodeFunction,
  failure,
  success,
  Validation,
  ValidationError,
} from '../codec'
import { SchemaType } from '../common'
import { DictionarySchema } from '../dictionary'
import { ListSchema } from '../list'
import { ObjectSchema } from '../object'
import { PrimitiveConstructor } from '../primitive'
import { Resolve, resolveSchema, Schema, SchemaLike } from '../schema'
import { TaggedUnionSchema } from '../tagged-union'
import { TupleSchema } from '../tuple'
import { mapIndexed } from '../utils'
import { JsonValue } from './common'
import { ContextImpl } from './context-impl'
import { JsonCodecMiddleware } from './middleware'

export class JsonCodec implements Codec<JsonValue, JsonValue> {
  private readonly decodeInternal: DecodeFunction<unknown, JsonValue>

  private readonly encodeInternal: EncodeFunction<unknown, JsonValue>

  constructor(middlewares: JsonCodecMiddleware[] = []) {
    this.decodeInternal = middlewares.reduceRight((prev, middleware) => {
      if (middleware.decode) {
        return middleware.decode(prev)
      }
      return prev
    }, this.decodeCore.bind(this))

    this.encodeInternal = middlewares.reduceRight((prev, middleware) => {
      if (middleware.encode) {
        return middleware.encode(prev)
      }
      return prev
    }, this.encodeCore.bind(this))
  }

  public encode<S extends SchemaLike>(
    schemaLike: S,
    value: Resolve<S>,
  ): JsonValue {
    const schema = resolveSchema(schemaLike)
    const context = new ContextImpl()

    return this.encodeInternal(context, schema, value)
  }

  public decode<S extends SchemaLike>(
    schemaLike: S,
    value: JsonValue,
  ): Validation<Resolve<S>> {
    const schema = resolveSchema(schemaLike)
    const context = new ContextImpl()

    return this.decodeInternal(context, schema, value) as Validation<Resolve<S>>
  }

  private encodeCore(context: Context, schema: Schema, value: any): JsonValue {
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
          : this.encodeInternal(context, schema.childSchema, value)

      case SchemaType.Nullable:
        return value === null
          ? null
          : this.encodeInternal(context, schema.childSchema, value)

      case SchemaType.List:
        return (value as any[]).map((element, i) =>
          this.encodeInternal(context.child(i), schema.childSchema, element),
        )

      case SchemaType.Dictionary:
        return mapIndexed(value, (element, k) =>
          this.encodeInternal(context.child(k), schema.childSchema, element),
        )

      case SchemaType.Tuple:
        return (value as any[]).map((element, i) =>
          this.encodeInternal(
            context.child(i),
            schema.childSchemas[i],
            element,
          ),
        )

      case SchemaType.Object:
        return mapIndexed(schema.fields, (resolve, key) =>
          this.encodeInternal(context.child(key), resolve(), value[key]),
        )

      case SchemaType.Refinement:
        return schema.encode(
          context,
          this.encodeInternal(context, schema.baseSchema, value),
        )

      case SchemaType.TaggedUnion:
        return {
          type: value.type,
          [value.type]: this.encodeInternal(
            context.child(value.type),
            schema.schemaMap[value.type],
            value[value.type],
          ),
        }

      default:
        throw new Error('unsupported')
    }
  }

  private decodeTaggedUnion(
    context: Context,
    schema: TaggedUnionSchema<any>,
    value: JsonValue,
  ): Validation<unknown> {
    if (value === undefined || value === null) {
      return context.failure({
        message: 'missing value',
        rule: 'required',
        value,
      })
    }

    switch (typeof value) {
      case 'boolean':
      case 'string':
      case 'number':
        return context.failure({
          message: 'invalid value for TaggedUnion',
          rule: 'taggedUnion',
          value,
        })
    }

    if (Array.isArray(value)) {
      return context.failure({
        message: 'invalid value for TaggedUnion',
        rule: 'taggedUnion',
        value,
      })
    }

    const type = value.type
    if (
      typeof type !== 'string' ||
      !Object.keys(schema.schemaMap).includes(type)
    ) {
      return context.failure({
        message: 'invalid type of TaggedUnion',
        rule: 'taggedUnion.type',
        value,
      })
    }

    return either.map((v: unknown) => {
      return {
        type,
        [type]: v,
      }
    })(
      this.decodeInternal(
        context.child(type),
        resolveSchema(schema.schemaMap[type]),
        value[type],
      ),
    )
  }

  private decodeDictionary(
    context: Context,
    schema: DictionarySchema<unknown>,
    value: JsonValue,
  ): Validation<unknown> {
    if (value === undefined || value === null) {
      return context.failure({
        message: 'missing value',
        rule: 'required',
        value,
      })
    }

    switch (typeof value) {
      case 'boolean':
      case 'string':
      case 'number':
        return context.failure({
          message: 'invalid value for Dictionary',
          rule: 'dictionary',
          value,
        })
    }

    if (Array.isArray(value)) {
      return context.failure({
        message: 'invalid value for Dictionary',
        rule: 'dictionary',
        value,
      })
    }

    const validationEntries = Object.entries(value).map(
      ([k, v]) =>
        [
          k,
          this.decodeInternal(context.child(k), schema.childSchema, v),
        ] as const,
    )

    const hasFailure = validationEntries.some(([_, v]) => either.isLeft(v))
    if (!hasFailure) {
      return success(
        Object.fromEntries(
          validationEntries.map(
            ([k, v]) =>
              [
                k,
                either.getOrElse<ValidationError[], unknown>(() => {
                  throw new Error('invalid case')
                })(v),
              ] as const,
          ),
        ),
      )
    }

    return failure(
      validationEntries.flatMap(([_, v]) =>
        either.fold<ValidationError[], unknown, ValidationError[]>(
          errors => errors,
          () => [],
        )(v),
      ),
    )
  }

  private decodeCore(
    context: Context,
    schema: Schema,
    value: JsonValue,
  ): Validation<unknown> {
    switch (schema.type) {
      case SchemaType.Any:
        return success(value)

      case SchemaType.Primitive:
        return this.decodePrimitive(context, schema.native, value)

      case SchemaType.Enum:
        if (Object.values(schema.enumValues).includes(value)) {
          return success(value)
        }

        return context.failure({
          message: 'invalid value for Enum',
          rule: 'enum',
          value,
        })

      case SchemaType.Optional:
        return value === undefined
          ? success(undefined)
          : this.decodeInternal(context, schema.childSchema, value)

      case SchemaType.Nullable:
        return value === null
          ? success(null)
          : this.decodeInternal(context, schema.childSchema, value)

      case SchemaType.List: {
        return this.decodeList(context, schema, value)
      }

      case SchemaType.Dictionary: {
        return this.decodeDictionary(context, schema, value)
      }

      case SchemaType.Tuple: {
        return this.decodeTuple(context, schema, value)
      }

      case SchemaType.Object: {
        return this.decodeObject(context, schema, value)
      }

      case SchemaType.Refinement:
        return either.map<unknown, Validation<unknown>>(v =>
          schema.decode(context, v),
        )(this.decodeInternal(context, schema.baseSchema, value))

      case SchemaType.TaggedUnion: {
        return this.decodeTaggedUnion(context, schema, value)
      }

      default:
        throw new Error(`unsupported type: ${schema}`)
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

  private decodeTuple(
    context: Context,
    schema: TupleSchema,
    value: JsonValue,
  ): Validation<unknown> {
    if (!Array.isArray(value)) {
      return context.failure({
        message: 'invalid value for Tuple',
        rule: 'tuple',
        value,
      })
    }

    if (value.length !== schema.childSchemas.length) {
      return context.failure({
        message: 'invalid length for Tuple',
        rule: 'tuple.length',
        value,
      })
    }

    const validations = value.map((v, i) => {
      return this.decodeInternal(context.child(i), schema.childSchemas[i], v)
    })

    const hasFailure = validations.some(either.isLeft)
    if (!hasFailure) {
      return success(
        validations.map(
          either.getOrElse<ValidationError[], unknown>(() => {
            throw new Error('invalid case')
          }),
        ),
      )
    }

    return failure(
      validations.flatMap(
        either.fold(
          errors => errors,
          () => [],
        ),
      ),
    )
  }

  private decodeList(
    context: Context,
    schema: ListSchema,
    value: JsonValue,
  ): Validation<unknown> {
    const values = Array.isArray(value) ? value : [value]
    const validations = values.map((v, i) => {
      return this.decodeInternal(context.child(i), schema.childSchema, v)
    })

    const hasFailure = validations.some(either.isLeft)
    if (!hasFailure) {
      return success(
        validations.map(
          either.getOrElse<ValidationError[], unknown>(() => {
            throw new Error('invalid case')
          }),
        ),
      )
    }

    return failure(
      validations.flatMap(
        either.fold(
          errors => errors,
          () => [],
        ),
      ),
    )
  }

  private decodeObject(
    context: Context,
    schema: ObjectSchema<any>,
    value: JsonValue,
  ): Validation<unknown> {
    if (value === undefined || value === null) {
      return context.failure({
        message: 'missing value',
        rule: 'required',
        value,
      })
    }

    switch (typeof value) {
      case 'boolean':
      case 'string':
      case 'number':
        return context.failure({
          message: 'invalid value for Object',
          rule: 'object',
          value,
        })
    }

    if (Array.isArray(value)) {
      return context.failure({
        message: 'invalid value for Object',
        rule: 'object',
        value,
      })
    }

    const entries = Object.entries(schema.fields).map(([k, schemaLike]) => {
      const schema = resolveSchema(schemaLike)
      return [
        k,
        this.decodeInternal(context.child(k), schema, value[k]),
      ] as const
    })

    const hasFailure = entries.some(([_, v]) => either.isLeft(v))
    if (!hasFailure) {
      return success(
        Object.fromEntries(
          entries.map(
            ([k, v]) =>
              [
                k,
                either.getOrElse<ValidationError[], unknown>(() => {
                  throw new Error('invalid case')
                })(v),
              ] as const,
          ),
        ),
      )
    }

    return failure(
      entries.flatMap(([_, v]) =>
        either.fold<ValidationError[], unknown, ValidationError[]>(
          errors => errors,
          () => [],
        )(v),
      ),
    )
  }

  private decodePrimitive(
    context: Context,
    nativeConstructor: PrimitiveConstructor,
    value: JsonValue,
  ): Validation<unknown> {
    if (value === undefined || value === null) {
      return context.failure({
        message: 'missing value',
        rule: 'required',
        value,
      })
    }

    switch (nativeConstructor) {
      case Boolean:
        switch (typeof value) {
          case 'boolean':
            return success(value)
          case 'number':
            return success(Boolean(value))
          case 'string':
            switch (value) {
              case 'true':
              case '1':
                return success(true)
              case 'false':
              case '0':
                return success(false)
              default:
                return context.failure({
                  message: 'invalid value for Boolean',
                  rule: 'boolean',
                  value,
                })
            }
          default:
            return context.failure({
              message: 'invalid value for Boolean',
              rule: 'boolean',
              value,
            })
        }
      case Number:
        switch (typeof value) {
          case 'boolean':
          case 'string': {
            const numberValue = Number(value)
            if (isNaN(numberValue)) {
              return context.failure({
                message: 'invalid value for Number',
                rule: 'number',
                value,
              })
            }
            return success(numberValue)
          }
          case 'number':
            return success(value)
          default:
            return context.failure({
              message: 'invalid value for Number',
              rule: 'number',
              value,
            })
        }
      case String:
        switch (typeof value) {
          case 'boolean':
          case 'number':
            return success(String(value))
          case 'string':
            return success(value)
          default:
            return context.failure({
              message: 'invalid value for String',
              rule: 'string',
              value,
            })
        }
      case BigInt:
        switch (typeof value) {
          case 'boolean':
          case 'number':
          case 'string': {
            try {
              return success(BigInt(value))
            } catch {
              return context.failure({
                message: 'invalid value for Integer',
                rule: 'integer',
                value,
              })
            }
          }
          default:
            return context.failure({
              message: 'invalid value for Integer',
              rule: 'integer',
              value,
            })
        }
      case Date:
        switch (typeof value) {
          case 'number':
          case 'string': {
            const dateValue = new Date(value)
            if (isNaN(dateValue.getTime())) {
              return context.failure({
                message: 'invalid value for Date',
                rule: 'Date',
                value,
              })
            }
            return success(dateValue)
          }
          default:
            return context.failure({
              message: 'invalid value for Date',
              rule: 'Date',
              value,
            })
        }
      case ArrayBuffer:
        switch (typeof value) {
          case 'string':
            return success(Buffer.from(value, 'base64').buffer)
          default:
            return context.failure({
              message: 'invalid value for ArrayBuffer',
              rule: 'ArrayBuffer',
              value,
            })
        }

      case Int8Array:
        switch (typeof value) {
          case 'string':
            return success(new Int8Array(Buffer.from(value, 'base64').buffer))
          default:
            return context.failure({
              message: 'invalid value for Int8Array',
              rule: 'Int8Array',
              value,
            })
        }

      case Uint8Array:
        switch (typeof value) {
          case 'string':
            return success(new Uint8Array(Buffer.from(value, 'base64').buffer))
          default:
            return context.failure({
              message: 'invalid value for Uint8Array',
              rule: 'Uint8Array',
              value,
            })
        }

      case Uint8ClampedArray:
        switch (typeof value) {
          case 'string':
            return success(
              new Uint8ClampedArray(Buffer.from(value, 'base64').buffer),
            )
          default:
            return context.failure({
              message: 'invalid value for Uint8ClampedArray',
              rule: 'Uint8ClampedArray',
              value,
            })
        }

      case Int16Array:
        switch (typeof value) {
          case 'string':
            return success(new Int16Array(Buffer.from(value, 'base64').buffer))
          default:
            return context.failure({
              message: 'invalid value for Int16Array',
              rule: 'Int16Array',
              value,
            })
        }

      case Uint16Array:
        switch (typeof value) {
          case 'string':
            return success(new Uint16Array(Buffer.from(value, 'base64').buffer))
          default:
            return context.failure({
              message: 'invalid value for Uint16Array',
              rule: 'Uint16Array',
              value,
            })
        }

      case Int32Array:
        switch (typeof value) {
          case 'string':
            return success(new Int32Array(Buffer.from(value, 'base64').buffer))
          default:
            return context.failure({
              message: 'invalid value for Int32Array',
              rule: 'Int32Array',
              value,
            })
        }

      case Uint32Array:
        switch (typeof value) {
          case 'string':
            return success(new Uint32Array(Buffer.from(value, 'base64').buffer))
          default:
            return context.failure({
              message: 'invalid value for Uint32Array',
              rule: 'Uint32Array',
              value,
            })
        }

      case Float32Array:
        switch (typeof value) {
          case 'string':
            return success(
              new Float32Array(Buffer.from(value, 'base64').buffer),
            )
          default:
            return context.failure({
              message: 'invalid value for Float32Array',
              rule: 'Float32Array',
              value,
            })
        }

      case Float64Array:
        switch (typeof value) {
          case 'string':
            return success(
              new Float64Array(Buffer.from(value, 'base64').buffer),
            )
          default:
            return context.failure({
              message: 'invalid value for Float64Array',
              rule: 'Float64Array',
              value,
            })
        }

      case BigInt64Array:
        switch (typeof value) {
          case 'string':
            return success(
              new BigInt64Array(Buffer.from(value, 'base64').buffer),
            )
          default:
            return context.failure({
              message: 'invalid value for BigInt64Array',
              rule: 'BigInt64Array',
              value,
            })
        }

      case BigUint64Array:
        switch (typeof value) {
          case 'string':
            return success(
              new BigUint64Array(Buffer.from(value, 'base64').buffer),
            )
          default:
            return context.failure({
              message: 'invalid value for BigUint64Array',
              rule: 'BigUint64Array',
              value,
            })
        }

      case Buffer:
        switch (typeof value) {
          case 'string':
            return success(Buffer.from(value, 'base64'))
          default:
            return context.failure({
              message: 'invalid value for Buffer',
              rule: 'Buffer',
              value,
            })
        }

      case RegExp:
        switch (typeof value) {
          case 'string':
            return success(new RegExp(value))
          default:
            return context.failure({
              message: 'invalid value for RegExp',
              rule: 'RegExp',
              value,
            })
        }

      case URL:
        switch (typeof value) {
          case 'string':
            return success(new URL(value))
          default:
            return context.failure({
              message: 'invalid value for URL',
              rule: 'URL',
              value,
            })
        }

      case Temporal.Absolute:
        switch (typeof value) {
          case 'number':
          case 'bigint':
            return success(Temporal.Absolute.fromEpochMilliseconds(value))
          case 'string': {
            try {
              return success(Temporal.Absolute.from(value))
            } catch {
              return context.failure({
                message: 'invalid value for Temporal.Absolute',
                rule: 'Temporal.Absolute',
                value,
              })
            }
          }
          default:
            return context.failure({
              message: 'invalid value for Temporal.Absolute',
              rule: 'Temporal.Absolute',
              value,
            })
        }

      case Temporal.Date:
        switch (typeof value) {
          case 'string':
            try {
              return success(Temporal.Date.from(value))
            } catch {
              return context.failure({
                message: 'invalid value for Temporal.Date',
                rule: 'Temporal.Date',
                value,
              })
            }
          default:
            return context.failure({
              message: 'invalid value for Temporal.Date',
              rule: 'Temporal.Date',
              value,
            })
        }

      case Temporal.Time:
        switch (typeof value) {
          case 'string':
            try {
              return success(Temporal.Time.from(value))
            } catch {
              return context.failure({
                message: 'invalid value for Temporal.Time',
                rule: 'Temporal.Time',
                value,
              })
            }
          default:
            return context.failure({
              message: 'invalid value for Temporal.Time',
              rule: 'Temporal.Time',
              value,
            })
        }

      case Temporal.DateTime:
        switch (typeof value) {
          case 'string':
            try {
              return success(Temporal.DateTime.from(value))
            } catch {
              return context.failure({
                message: 'invalid value for Temporal.DateTime',
                rule: 'Temporal.DateTime',
                value,
              })
            }

          default:
            return context.failure({
              message: 'invalid value for Temporal.DateTime',
              rule: 'Temporal.DateTime',
              value,
            })
        }

      case Temporal.Duration:
        switch (typeof value) {
          case 'number':
          case 'bigint':
            try {
              return success(Temporal.Duration.from({ milliseconds: value }))
            } catch {
              return context.failure({
                message: 'invalid value for Temporal.Duration',
                rule: 'Temporal.DateTime',
                value,
              })
            }

          case 'string':
            try {
              return success(Temporal.Duration.from(value))
            } catch {
              return context.failure({
                message: 'invalid value for Temporal.Duration',
                rule: 'Temporal.DateTime',
                value,
              })
            }

          default:
            return context.failure({
              message: 'invalid value for Temporal.Duration',
              rule: 'Temporal.Duration',
              value,
            })
        }

      default:
        throw new Error('invalid primitive type')
    }
  }
}
