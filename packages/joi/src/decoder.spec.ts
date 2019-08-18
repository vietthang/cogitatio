import 'jest'

import {
  Enum,
  List,
  Nullable,
  Optional,
  Property,
  Record,
  resolveSchema,
  SchemaLike,
  Tuple,
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
  MinRefinement,
  Port,
  UniqueItems,
  Uri,
  Uuid,
} from '@cogitatio/extra'
import Joi from '@hapi/joi'
import { JoiDecoder } from '../src'

describe('resolveJoiSchema', () => {
  const joiDecoder = new JoiDecoder()

  const testCases: Array<{
    name: string
    resolve: () => SchemaLike
    expected?: Joi.Schema
    throws?: boolean
  }> = [
    {
      name: 'string',
      resolve: () => String,
      expected: Joi.string(),
    },
    {
      name: 'number',
      resolve: () => Number,
      expected: Joi.number(),
    },
    {
      name: 'Date',
      resolve: () => Date,
      expected: Joi.date(),
    },
    {
      name: 'ArrayBuffer',
      resolve: () => ArrayBuffer,
      expected: Joi.binary(),
    },
    {
      name: 'Buffer',
      resolve: () => Buffer,
      expected: Joi.binary(),
    },
    {
      name: 'string[]',
      resolve: () => List(String),
      expected: Joi.array().items(Joi.string()),
    },
    {
      name: '[string, number, boolean]',
      resolve: () => Tuple(String, Number, Boolean),
      expected: Joi.array()
        .ordered(Joi.string(), Joi.number(), Joi.boolean())
        .length(3),
    },
    {
      name: 'string?',
      resolve: () => Optional(String),
      expected: Joi.string().optional(),
    },
    {
      name: 'string | null',
      resolve: () => Nullable(String),
      expected: Joi.string().allow(null),
    },
    {
      name: 'object',
      resolve: () => Record({ foo: String, bar: Optional(Number) }),
      expected: Joi.object({
        foo: Joi.string(),
        bar: Joi.number().optional(),
      }),
    },
    {
      name: 'bigint',
      resolve: () => BigInt,
      throws: true,
    },
    {
      name: 'email',
      resolve: () => Email,
      expected: Joi.string().email(),
    },
    {
      name: 'uri',
      resolve: () => Uri,
      expected: Joi.string().uri(),
    },
    {
      name: 'integer',
      resolve: () => Integer,
      expected: Joi.number().integer(),
    },
    {
      name: 'port',
      resolve: () => Port,
      expected: Joi.number()
        .integer()
        .port(),
    },
    {
      name: 'ip',
      resolve: () => Ip,
      expected: Joi.string().ip(),
    },
    {
      name: 'hostname',
      resolve: () => Hostname,
      expected: Joi.string().hostname(),
    },
    {
      name: 'uuid',
      resolve: () => Uuid,
      expected: Joi.string().uuid(),
    },
    {
      name: 'min',
      resolve: () => Min(0)(Number),
      expected: Joi.number().min(0),
    },
    {
      name: 'min integer',
      resolve: () => Min(0)(Integer),
      expected: Joi.number()
        .integer()
        .min(0),
    },
    {
      name: 'max',
      resolve: () => Max(100)(Number),
      expected: Joi.number().max(100),
    },
    {
      name: 'minLength',
      resolve: () => MinLength(1)(String),
      expected: Joi.string().min(1),
    },
    {
      name: 'minLength email',
      resolve: () => MinLength(1)(Email),
      expected: Joi.string()
        .email()
        .min(1),
    },
    {
      name: 'maxLength',
      resolve: () => MaxLength(100)(String),
      expected: Joi.string().max(100),
    },
    {
      name: 'minItems string[]',
      resolve: () => MinItems(1)(List(String)),
      expected: Joi.array()
        .items(Joi.string())
        .min(1),
    },
    {
      name: 'maxItems string[]',
      resolve: () => MaxItems(1)(List(String)),
      expected: Joi.array()
        .items(Joi.string())
        .max(1),
    },
    {
      name: 'default',
      resolve: () => Default('1')(String),
      expected: Joi.string()
        .optional()
        .default('1'),
    },
    {
      name: 'uniqueItems',
      resolve: () => UniqueItems()(List(String)),
      expected: Joi.array()
        .items(Joi.string())
        .unique(),
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
          public complex!: Integer & MinRefinement<10>
        }
        return A
      },
      expected: Joi.object({
        str: Joi.string(),
        num: Joi.number(),
        complex: Joi.number()
          .integer()
          .min(10)
          .optional()
          .default(1),
      }),
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
      expected: Joi.only('Male', 'Female'),
    },
    {
      name: 'id',
      resolve: () => {
        class A {}
        return Id64<A>()
      },
      expected: Joi.string().regex(/^\d+$/),
    },
  ]

  for (const { name, resolve, throws, expected } of testCases) {
    it(name, () => {
      if (throws) {
        expect(() =>
          joiDecoder.resolveJoiSchema(resolveSchema(resolve())),
        ).toThrow()
      } else {
        const result = joiDecoder.resolveJoiSchema(resolveSchema(resolve()))
        expect(result.describe()).toEqual(expected!.describe())
      }
    })
  }
})
