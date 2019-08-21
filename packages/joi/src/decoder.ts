import {
  IRefineSchema,
  PrimitiveConstructor,
  Resolve,
  resolveSchema,
  Schema,
  SchemaLike,
  SchemaType,
} from '@cogitatio/core'
import { IDecoder } from '@cogitatio/extra'
import * as Joi from '@hapi/joi'
import { ITaggedUnionSchema } from '../../core/src/taggedUnion'

type Transformer<T, U> = (value: T) => U

function cache<T extends object, U>(
  transfomer: Transformer<T, U>,
): Transformer<T, U> {
  const resultCache = new WeakMap<T, U>()
  return (value: T): U => {
    if (resultCache.has(value)) {
      return resultCache.get(value)!
    }
    const result = transfomer(value)
    resultCache.set(value, result)
    return result
  }
}

function isJoiStringSchema(schema: Joi.Schema): schema is Joi.StringSchema {
  return schema.schemaType === 'string'
}

function isJoiNumberSchema(schema: Joi.Schema): schema is Joi.NumberSchema {
  return schema.schemaType === 'number'
}

function isJoiObjectSchema(schema: Joi.Schema): schema is Joi.ObjectSchema {
  return schema.schemaType === 'object'
}

function isJoiArraySchema(schema: Joi.Schema): schema is Joi.ArraySchema {
  return schema.schemaType === 'array'
}

function guardResolve<T extends Joi.AnySchema, U>(
  schema: Joi.Schema,
  guard: (s: Joi.Schema) => s is T,
  resolve: (s: T) => U,
) {
  if (!guard(schema)) {
    throw new Error('invalid')
  }
  return resolve(schema)
}

export type SchemaResolver = (schema: Schema) => Joi.Schema | undefined

export interface IJoiDecoderOptions {
  joi: typeof Joi
}

export interface JoiDecoderPlugin {
  transformJoi?: (j: Joi.Root) => Joi.Root
  resolveSchema?: (
    joi: Joi.Root,
    schema: Schema,
    resolveJoiSchema: (s: Schema) => Joi.Schema,
  ) => Joi.Schema | undefined
}

export class JoiDecoder implements IDecoder<unknown> {
  public readonly resolveJoiSchema = cache(
    (schema: Schema): Joi.Schema => {
      for (const plugin of this.plugins) {
        if (plugin.resolveSchema) {
          const joiSchema = plugin.resolveSchema(
            this.joi,
            schema,
            this.resolveJoiSchema,
          )
          if (joiSchema) {
            return joiSchema
          }
        }
      }
      switch (schema.type) {
        case SchemaType.Any:
          return this.joi.any()

        case SchemaType.Primitive:
          return this.resolvePrimitveSchema(schema.native)

        case SchemaType.Enum:
          return this.joi.any().only(...Object.values(schema.enumValues))

        case SchemaType.Optional:
          return this.resolveJoiSchema(schema.childSchema).optional()

        case SchemaType.Nullable:
          return this.resolveJoiSchema(schema.childSchema).allow(null)

        case SchemaType.List:
          return this.joi
            .array()
            .items(this.resolveJoiSchema(schema.childSchema))

        case SchemaType.Dictionary:
          return this.joi
            .object()
            .pattern(/.*/, this.resolveJoiSchema(schema.childSchema))

        case SchemaType.Tuple:
          return this.joi
            .array()
            .length(schema.childSchemas.length)
            .ordered(
              ...schema.childSchemas.map(childSchema =>
                this.resolveJoiSchema(childSchema),
              ),
            )
        case SchemaType.Object:
          return this.resolveObjectSchema(schema.fields())

        case SchemaType.Brand:
          return this.resolveBrandSchema(schema)

        case SchemaType.TaggedUnion:
          return this.resolveTaggedUnionSchema(schema)

        default:
          throw new Error('unsupported')
      }
    },
  )

  private readonly resolveBrandSchema = cache(
    (schema: IRefineSchema): Joi.Schema => {
      return Object.entries(schema.brand as {}).reduce(
        (joiSchema, [key, value]) => {
          switch (key) {
            case 'email':
              return value
                ? guardResolve(joiSchema, isJoiStringSchema, s => s.email())
                : joiSchema

            case 'uri':
              return value
                ? guardResolve(joiSchema, isJoiStringSchema, s => s.uri())
                : joiSchema

            case 'integer':
              return value
                ? guardResolve(joiSchema, isJoiNumberSchema, s => s.integer())
                : joiSchema

            case 'port':
              return value
                ? guardResolve(joiSchema, isJoiNumberSchema, s => s.port())
                : joiSchema

            case 'ip':
              return value
                ? guardResolve(joiSchema, isJoiStringSchema, s => s.ip())
                : joiSchema

            case 'hostname':
              return value
                ? guardResolve(joiSchema, isJoiStringSchema, s => s.hostname())
                : joiSchema

            case 'uuid':
              return value
                ? guardResolve(joiSchema, isJoiStringSchema, s => s.uuid())
                : joiSchema

            case 'min':
              return guardResolve(joiSchema, isJoiNumberSchema, s =>
                s.min(value as number),
              )

            case 'max':
              return guardResolve(joiSchema, isJoiNumberSchema, s =>
                s.max(value as number),
              )

            case 'minLength':
              return guardResolve(joiSchema, isJoiStringSchema, s =>
                s.min(value as number),
              )

            case 'maxLength':
              return guardResolve(joiSchema, isJoiStringSchema, s =>
                s.max(value as number),
              )

            case 'minItems':
              return guardResolve(joiSchema, isJoiArraySchema, s =>
                s.min(value as number),
              )

            case 'maxItems':
              return guardResolve(joiSchema, isJoiArraySchema, s =>
                s.max(value as number),
              )

            case 'uniqueItems':
              return guardResolve(joiSchema, isJoiArraySchema, s => s.unique())

            case 'default':
              return joiSchema.optional().default(value)

            case 'id64':
              return guardResolve(joiSchema, isJoiStringSchema, s =>
                s.regex(/^\d+$/),
              )

            default:
              throw new Error('unhandled refinement')
          }
        },
        this.resolveJoiSchema(schema.childSchema),
      )
    },
  )

  private readonly resolveObjectSchema = cache(
    (descriptor: any): Joi.Schema => {
      return this.joi.object(
        Object.fromEntries(
          Object.entries(descriptor).map(([key, value]) => {
            return [
              key,
              this.resolveJoiSchema(resolveSchema(value as SchemaLike)),
            ]
          }),
        ),
      )
    },
  )

  private readonly resolvePrimitveSchema = cache(
    (native: PrimitiveConstructor): Joi.Schema => {
      switch (native) {
        case Boolean:
          return this.joi.bool()
        case Number:
          return this.joi.number()
        case String:
          return this.joi.string()
        case BigInt:
          throw new Error('bigint is not supported by joi yet')
        case Date:
          return this.joi.date()
        case ArrayBuffer:
          return this.joi.binary()
        case Buffer:
          return this.joi.binary()
        case RegExp:
          return this.joi.object().type(RegExp)
        default:
          throw new Error('invalid primitive type')
      }
    },
  )

  private readonly resolveTaggedUnionSchema = cache(
    (schema: ITaggedUnionSchema): Joi.Schema => {
      return this.joi.alternatives(
        ...Object.entries(schema.schemaMap).map(([key, childSchema]) => {
          return this.joi.object({
            [schema.discriminator]: this.joi.any().only(key),
            [key]: this.resolveJoiSchema(
              resolveSchema(childSchema as SchemaLike),
            ),
          })
        }),
      )
    },
  )

  private readonly joi: Joi.Root

  constructor(private readonly plugins: JoiDecoderPlugin[] = []) {
    this.joi = plugins.reduce((joi, plugin) => {
      return plugin.transformJoi ? plugin.transformJoi(joi) : joi
    }, Joi)
  }

  public decode<S extends SchemaLike>(schema: S, value: unknown): Resolve<S> {
    const result = this.resolveJoiSchema(resolveSchema(schema)).validate(
      value,
      {
        allowUnknown: true,
        stripUnknown: true,
        convert: true,
        presence: 'required',
      },
    )
    if (result.error) {
      throw result.error
    }
    return result.value as any
  }
}
