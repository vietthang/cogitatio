import {
  Constructor,
  PrimitiveConstructor,
  reflectClass,
  Schema,
  SchemaType,
} from '@anzenjs/core'
import { IDecoder } from '@anzenjs/extra'
import Joi, { Schema as JoiSchema } from 'joi'

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

export type SchemaResolver = (schema: Schema) => JoiSchema | undefined

export interface IJoiDecoderOptions {
  joi: typeof Joi
  validationOptions: Joi.ValidationOptions
  schemaResolvers?: SchemaResolver[]
}

export class JoiDecoder implements IDecoder<unknown> {
  private readonly resolveSchema = cache(
    (schema: Schema): JoiSchema => {
      if (this.options.schemaResolvers) {
        for (const resolver of this.options.schemaResolvers) {
          const maybeJoiSchema = resolver(schema)
          if (maybeJoiSchema) {
            return maybeJoiSchema
          }
        }
      }

      switch (schema.type) {
        case SchemaType.Primitive:
          return this.resolvePrimitveSchema(schema.native)
        case SchemaType.Enum:
          return this.options.joi.only(Object.values(schema.enumValues))
        case SchemaType.Optional:
          return this.resolveSchema(schema.childSchema).optional()
        case SchemaType.Nullable:
          return this.resolveSchema(schema.childSchema).allow(null)
        case SchemaType.List:
          return this.options.joi
            .array()
            .items(this.resolveSchema(schema.childSchema))
        case SchemaType.Tuple:
          return this.options.joi
            .array()
            .ordered(
              schema.childSchemas.map(childSchema =>
                this.resolveSchema(childSchema),
              ),
            )
        case SchemaType.Object:
          return this.resolveObjectSchema(schema.resolver())
        default:
          throw new Error('unsupported')
      }
    },
  )

  private readonly resolveObjectSchema = cache(
    (ctor: Constructor): JoiSchema => {
      const descriptor: any = reflectClass(ctor)
      if (!descriptor) {
        throw new Error(`missing schema for ${ctor}`)
      }
      const keys = Object.keys(descriptor)

      return this.options.joi.object(
        keys.reduce(
          (prev, key) => {
            return {
              ...prev,
              [key]: this.resolveSchema(descriptor[key]),
            }
          },
          {} as any,
        ),
      )
    },
  )

  private readonly resolvePrimitveSchema = cache(
    (native: PrimitiveConstructor): JoiSchema => {
      switch (native) {
        case Boolean:
          return this.options.joi.bool()
        case Number:
          return this.options.joi.number()
        case String:
          return this.options.joi.string()
        case BigInt:
          throw new Error('bigint is not supported by joi yet')
        case Date:
          return this.options.joi.date()
        case ArrayBuffer:
          return this.options.joi.binary()
        case Buffer:
          return this.options.joi.binary()
        default:
          throw new Error('invalid primitive type')
      }
    },
  )

  constructor(
    private readonly options: IJoiDecoderOptions = {
      joi: Joi,
      validationOptions: {
        allowUnknown: true,
        stripUnknown: true,
        convert: true,
        presence: 'required',
      },
    },
  ) {}

  public decode(schema: Schema) {
    return (value: unknown): any => {
      const result = this.resolveSchema(schema).validate(value)
      if (result.error) {
        throw result.error
      }
      return result.value
    }
  }
}
