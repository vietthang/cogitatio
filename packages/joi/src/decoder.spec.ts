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
  Email,
  Hostname,
  Id64,
  Ip,
  Port,
  refineEmail,
  refineHostname,
  refineIp,
  refinePort,
  refineUuid,
  Uuid,
} from '@cogitatio/extra'
import Joi from '@hapi/joi'
import { refineId64 } from '../../extra/src/id64'
import { JoiDecoder, refineBigInt } from '../src'

describe('resolveJoiSchema', () => {
  const joiDecoder = new JoiDecoder([]) // TODO refactor to plugins.spec.ts

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
      expected: Joi.any().custom(refineBigInt),
    },
    {
      name: 'email',
      resolve: () => Email,
      expected: Joi.string().custom(refineEmail),
    },
    {
      name: 'port',
      resolve: () => Port,
      expected: Joi.any()
        .custom(refineBigInt)
        .custom(refinePort),
    },
    {
      name: 'ip',
      resolve: () => Ip,
      expected: Joi.string().custom(refineIp),
    },
    {
      name: 'hostname',
      resolve: () => Hostname,
      expected: Joi.string().custom(refineHostname),
    },
    {
      name: 'uuid',
      resolve: () => Uuid,
      expected: Joi.string().custom(refineUuid),
    },
    {
      name: 'class',
      resolve: () => {
        class A {
          @Property(String)
          public str!: string

          @Property(Number)
          public num!: number
        }
        return A
      },
      expected: Joi.object({
        str: Joi.string(),
        num: Joi.number(),
      }),
    },
    {
      name: 'nested class',
      resolve: () => {
        class A {
          @Property(String)
          public str!: string

          @Property(Number)
          public num!: number
        }
        class B {
          @Property(A)
          public a!: A
        }
        return B
      },
      expected: Joi.object({
        a: Joi.object({
          str: Joi.string(),
          num: Joi.number(),
        }),
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
      expected: Joi.valid('Male', 'Female'),
    },
    {
      name: 'id',
      resolve: () => Id64,
      expected: Joi.string().custom(refineId64),
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
        expect(result.describe()).toMatchObject(expected!.describe())
      }
    })
  }
})
