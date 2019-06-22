import {
  Constructor,
  PrimitiveConstructor,
  reflectClass,
  resolveSchema,
  Schema,
  SchemaType,
} from '@anzenjs/core'
import { IDecoder } from '@anzenjs/extra'
import Joi, { Schema as JoiSchema } from 'joi'
import { getPropertyTransformers } from './transformer'

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
  private readonly resolveJoiSchema = cache(
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
          return this.resolveJoiSchema(schema.childSchema).optional()
        case SchemaType.Nullable:
          return this.resolveJoiSchema(schema.childSchema).allow(null)
        case SchemaType.List:
          return this.options.joi
            .array()
            .items(this.resolveJoiSchema(schema.childSchema))
        case SchemaType.Dictionary:
          return this.options.joi
            .object()
            .pattern(/.*/, this.resolveJoiSchema(schema.childSchema))

        case SchemaType.Tuple:
          return this.options.joi
            .array()
            .length(schema.childSchemas.length)
            .ordered(
              schema.childSchemas.map(childSchema =>
                this.resolveJoiSchema(childSchema),
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
            let joiSchema = this.resolveJoiSchema(
              resolveSchema(descriptor[key]),
            )
            const transformers = getPropertyTransformers(ctor, key)
            for (const transformer of transformers) {
              joiSchema = transformer(joiSchema)
            }
            return {
              ...prev,
              [key]: joiSchema,
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
          throw new Error('ArrayBuffer is not supported by joi yet')
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
      const result = this.resolveJoiSchema(schema).validate(
        value,
        this.options.validationOptions,
      )
      if (result.error) {
        throw result.error
      }
      return result.value
    }
  }
}
