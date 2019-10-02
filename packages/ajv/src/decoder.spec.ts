import {
  Enum,
  List,
  Nullable,
  Optional,
  Property,
  Record,
  SchemaLike,
  Tuple,
  resolveSchema,
} from '@cogitatio/core'
import {
  Default,
  Email,
  Hostname,
  Id64,
  Integer,
  Ip,
  Max,
  MaxItems,
  MaxLength,
  Min,
  MinItems,
  MinLength,
  Port,
  UniqueItems,
  Uri,
  Uuid,
} from '@cogitatio/extra'
import { JSONSchema4 } from 'json-schema'
import { AjvDecoder } from './decoder'

describe('resolveJoiSchema', () => {
  const decoder = new AjvDecoder()

  const testCases: Array<{
    name: string
    resolve: () => SchemaLike
    expected?: JSONSchema4
    throws?: boolean
  }> = [
    {
      name: 'string',
      resolve: () => String,
      expected: {
        type: 'string',
      },
    },
    {
      name: 'number',
      resolve: () => Number,
      expected: {
        type: 'number',
      },
    },
    {
      name: 'Date',
      resolve: () => Date,
      expected: {
        type: 'string',
        format: 'date-time',
      },
    },
    {
      name: 'ArrayBuffer',
      resolve: () => ArrayBuffer,
      expected: {
        type: 'string',
        format: 'base64',
      },
    },
    {
      name: 'Buffer',
      resolve: () => Buffer,
      expected: {
        type: 'string',
        format: 'base64',
      },
    },
    {
      name: 'string[]',
      resolve: () => List(String),
      expected: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    {
      name: '[string, number, boolean]',
      resolve: () => Tuple(String, Number, Boolean),
      expected: {
        type: 'array',
        items: [
          {
            type: 'string',
          },
          {
            type: 'number',
          },
          {
            type: 'boolean',
          },
        ],
      },
    },
    {
      name: 'string?',
      resolve: () => Optional(String),
      expected: {
        type: 'string',
      },
    },
    {
      name: 'string | null',
      resolve: () => Nullable(String),
      expected: {
        type: ['string', 'null'],
      },
    },
    {
      name: 'object',
      resolve: () => Record({ foo: String, bar: Optional(Number) }),
      expected: {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
          },
          bar: {
            type: 'number',
          },
        },
        required: ['foo'],
      },
    },
    {
      name: 'bigint',
      resolve: () => BigInt,
      expected: {
        type: 'integer',
      },
    },
    {
      name: 'email',
      resolve: () => Email,
      expected: {
        type: 'string',
        format: 'email',
      },
    },
    {
      name: 'uri',
      resolve: () => Uri,
      expected: {
        type: 'string',
        format: 'uri',
      },
    },
    {
      name: 'integer',
      resolve: () => Integer,
      expected: {
        type: 'integer',
      },
    },
    {
      name: 'port',
      resolve: () => Port,
      expected: {
        type: 'integer',
        format: 'port',
      },
    },
    {
      name: 'ip',
      resolve: () => Ip,
      expected: {
        type: 'string',
        format: 'ip',
      },
    },
    {
      name: 'hostname',
      resolve: () => Hostname,
      expected: {
        type: 'string',
        format: 'hostname',
      },
    },
    {
      name: 'uuid',
      resolve: () => Uuid,
      expected: {
        type: 'string',
        format: 'uuid',
      },
    },
    {
      name: 'min',
      resolve: () => Min(0)(Number),
      expected: {
        type: 'number',
        minimum: 0,
      },
    },
    {
      name: 'min integer',
      resolve: () => Min(0)(Integer),
      expected: {
        type: 'integer',
        minimum: 0,
      },
    },
    {
      name: 'max',
      resolve: () => Max(100)(Number),
      expected: {
        type: 'number',
        maximum: 100,
      },
    },
    {
      name: 'minLength',
      resolve: () => MinLength(1)(String),
      expected: {
        type: 'string',
        minLength: 1,
      },
    },
    {
      name: 'minLength email',
      resolve: () => MinLength(1)(Email),
      expected: {
        type: 'string',
        format: 'email',
        minLength: 1,
      },
    },
    {
      name: 'maxLength',
      resolve: () => MaxLength(100)(String),
      expected: {
        type: 'string',
        maxLength: 100,
      },
    },
    {
      name: 'minItems string[]',
      resolve: () => MinItems(1)(List(String)),
      expected: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'string',
        },
      },
    },
    {
      name: 'maxItems string[]',
      resolve: () => MaxItems(1)(List(String)),
      expected: {
        type: 'array',
        maxItems: 1,
        items: {
          type: 'string',
        },
      },
    },
    {
      name: 'default',
      resolve: () => Default('1')(String),
      expected: {
        type: 'string',
        default: '1',
      },
    },
    {
      name: 'uniqueItems',
      resolve: () => UniqueItems()(List(String)),
      expected: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'string',
        },
      },
    },
    {
      name: 'class',
      resolve: () => {
        class A {
          @Property(String)
          public str!: string

          @Property(Number)
          public num!: number

          @Property(Integer, Default(1), Min(10))
          public complex!: Integer & Min<10>
        }

        return A
      },
      expected: {
        type: 'object',
        properties: {
          str: {
            type: 'string',
          },
          num: {
            type: 'number',
          },
          complex: {
            type: 'integer',
            default: 1,
            minimum: 10,
          },
        },
        required: ['str', 'num', 'complex'],
      },
    },
    {
      name: 'enum',
      resolve: () => {
        enum Gender {
          Male = 'Male',
          Female = 'Female',
        }

        return Enum(Gender)
      },
      expected: {
        enum: ['Male', 'Female'],
      },
    },
    {
      name: 'id',
      resolve: () => Id64,
      expected: {
        type: 'string',
      },
    },
  ]

  for (const { name, resolve, throws, expected } of testCases) {
    it(name, () => {
      if (throws) {
        expect(() =>
          decoder.resolveJsonSchema(resolveSchema(resolve())),
        ).toThrow()
      } else {
        const result = decoder.resolveJsonSchema(resolveSchema(resolve()))

        expect(result).toEqual(expected)
      }
    })
  }
})
