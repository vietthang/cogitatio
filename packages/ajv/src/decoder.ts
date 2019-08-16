import {
  IRefineSchema,
  PrimitiveConstructor,
  Resolve,
  resolveSchema,
  Schema,
  SchemaLike,
  SchemaType,
} from '@cogitatio/core'
import Ajv from 'ajv'
import { JSONSchema4, JSONSchema4TypeName } from 'json-schema'
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

export interface AjvDecoderOptions {
  ajv: Ajv.Ajv
}

export class AjvDecoder {
  public readonly resolveJsonSchema = cache(
    (schema: Schema): JSONSchema4 => {
      switch (schema.type) {
        case SchemaType.Primitive:
          return this.resolvePrimitveSchema(schema.native)

        case SchemaType.Enum:
          return {
            enum: Object.values(schema.enumValues),
          }

        case SchemaType.Optional:
          return this.resolveJsonSchema(schema.childSchema)

        case SchemaType.Nullable:
          const childJsonSchema = this.resolveJsonSchema(schema.childSchema)
          return {
            ...childJsonSchema,
            type: (Array.isArray(childJsonSchema.type)
              ? [...childJsonSchema.type, 'null']
              : [childJsonSchema.type, 'null']) as JSONSchema4TypeName[],
          }

        case SchemaType.List:
          return {
            type: 'array',
            items: this.resolveJsonSchema(schema.childSchema),
          }

        case SchemaType.Dictionary:
          return {
            type: 'object',
            patternProperties: {
              '/.*/': this.resolveJsonSchema(schema.childSchema),
            },
          }

        case SchemaType.Tuple:
          return {
            type: 'array',
            items: schema.childSchemas.map(s => this.resolveJsonSchema(s)),
          }

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
    (schema: IRefineSchema): JSONSchema4 => {
      return Object.entries(schema.brand as {}).reduce<JSONSchema4>(
        (jsonSchema, [key, v]) => {
          const value: any = v
          switch (key) {
            case 'email':
              return {
                ...jsonSchema,
                format: 'email',
              }

            case 'uri':
              return {
                ...jsonSchema,
                format: 'uri',
              }

            case 'integer':
              return {
                ...jsonSchema,
                type: 'integer',
              }

            case 'port':
              return {
                ...jsonSchema,
                format: 'port',
              }

            case 'ip':
              return {
                ...jsonSchema,
                format: 'ip',
              }

            case 'hostname':
              return {
                ...jsonSchema,
                format: 'hostname',
              }

            case 'uuid':
              return {
                ...jsonSchema,
                format: 'uuid',
              }

            case 'min':
              return {
                ...jsonSchema,
                minimum: value,
              }

            case 'max':
              return {
                ...jsonSchema,
                maximum: value,
              }

            case 'minLength':
              return {
                ...jsonSchema,
                minLength: value,
              }

            case 'maxLength':
              return {
                ...jsonSchema,
                maxLength: value,
              }

            case 'minItems':
              return {
                ...jsonSchema,
                minItems: value,
              }

            case 'maxItems':
              return {
                ...jsonSchema,
                maxItems: value,
              }

            case 'uniqueItems':
              return {
                ...jsonSchema,
                uniqueItems: value,
              }

            case 'default':
              return {
                ...jsonSchema,
                default: value,
              }

            case 'id':
              return jsonSchema

            default:
              throw new Error('unhandled refinement')
          }
        },
        this.resolveJsonSchema(schema.childSchema),
      )
    },
  )

  private readonly resolveObjectSchema = cache(
    (descriptor: any): JSONSchema4 => {
      return {
        type: 'object',
        properties: Object.fromEntries(
          Object.entries(descriptor).map(([key, schema]) => {
            return [key, this.resolveJsonSchema(resolveSchema(schema as any))]
          }),
        ),
        required: Object.entries(descriptor)
          .filter(([, s]) => {
            const schema = resolveSchema(s as any)
            return schema.type !== SchemaType.Optional
          })
          .map(([key]) => key),
      }
    },
  )

  private readonly resolvePrimitveSchema = cache(
    (native: PrimitiveConstructor): JSONSchema4 => {
      switch (native) {
        case Boolean:
          return {
            type: 'boolean',
          }
        case Number:
          return {
            type: 'number',
          }
        case String:
          return {
            type: 'string',
          }
        case BigInt:
          return {
            type: 'integer',
          }
        case Date:
          return {
            type: 'string',
            format: 'date-time',
          }
        case ArrayBuffer:
          return {
            type: 'string',
            format: 'base64',
          }
        case Buffer:
          return {
            type: 'string',
            format: 'base64',
          }
        default:
          throw new Error('invalid primitive type')
      }
    },
  )

  private readonly resolveTaggedUnionSchema = cache(
    (schema: ITaggedUnionSchema): JSONSchema4 => {
      return {
        oneOf: Object.entries(schema.schemaMap).map(([key, childSchema]) => {
          return {
            type: 'object',
            properties: {
              [schema.discriminator]: {
                enum: [key],
              },
              [key]: this.resolveJsonSchema(childSchema as any),
            },
          } as JSONSchema4
        }),
      }
    },
  )

  constructor(
    private readonly options: AjvDecoderOptions = {
      ajv: new Ajv({
        coerceTypes: 'array',
      }),
    },
  ) {}

  public async decode<S extends SchemaLike>(
    schema: S,
    value: unknown,
  ): Promise<Resolve<S>> {
    const validate = this.options.ajv.compile({
      ...this.resolveJsonSchema(resolveSchema(schema)),
      $async: true,
    })
    return validate(value)
  }
}
