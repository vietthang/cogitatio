import {
  Dictionary,
  Enum,
  List,
  Nullable,
  Optional,
  Property,
  resolveSchema,
  TaggedUnion,
  Tuple,
} from '@cogitatio/core'
import { failure, success, ValidationError } from '../codec'
import { JsonValue } from './common'
import { JsonCodec } from './json-codec'

describe('decode', () => {
  const decoder = new JsonCodec()

  describe('boolean', () => {
    it('boolean values', () => {
      expect(decoder.decode(Boolean, true)).toStrictEqual(success(true))
      expect(decoder.decode(Boolean, false)).toStrictEqual(success(false))
    })

    it('number values', () => {
      expect(decoder.decode(Boolean, 1)).toStrictEqual(success(true))
      expect(decoder.decode(Boolean, -1)).toStrictEqual(success(true))
      expect(decoder.decode(Boolean, 0)).toStrictEqual(success(false))
    })

    it('string values', () => {
      expect(decoder.decode(Boolean, 'true')).toStrictEqual(success(true))
      expect(decoder.decode(Boolean, 'false')).toStrictEqual(success(false))
      expect(decoder.decode(Boolean, '1')).toStrictEqual(success(true))
      expect(decoder.decode(Boolean, '0')).toStrictEqual(success(false))
      expect(decoder.decode(Boolean, 'string')).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Boolean',
            value: 'string',
            paths: [],
            rule: 'boolean',
          }),
        ]),
      )
    })

    it('null & undefined', () => {
      expect(decoder.decode(Boolean, null)).toStrictEqual(
        failure([
          new ValidationError({
            message: 'missing value',
            value: null,
            paths: [],
            rule: 'required',
          }),
        ]),
      )
      expect(decoder.decode(Boolean, undefined)).toStrictEqual(
        failure([
          new ValidationError({
            message: 'missing value',
            value: undefined,
            paths: [],
            rule: 'required',
          }),
        ]),
      )
    })

    it('object values', () => {
      expect(decoder.decode(Boolean, { foo: 'bar' })).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Boolean',
            value: { foo: 'bar' },
            paths: [],
            rule: 'boolean',
          }),
        ]),
      )
    })

    it('array values', () => {
      expect(decoder.decode(Boolean, ['true'])).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Boolean',
            value: ['true'],
            paths: [],
            rule: 'boolean',
          }),
        ]),
      )
      expect(decoder.decode(Boolean, [true])).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Boolean',
            value: [true],
            paths: [],
            rule: 'boolean',
          }),
        ]),
      )
    })
  })

  describe('number', () => {
    it('boolean values', () => {
      expect(decoder.decode(Number, true)).toStrictEqual(success(1))
      expect(decoder.decode(Number, false)).toStrictEqual(success(0))
    })

    it('number values', () => {
      expect(decoder.decode(Number, 1)).toStrictEqual(success(1))
      expect(decoder.decode(Number, -1)).toStrictEqual(success(-1))
      expect(decoder.decode(Number, 0)).toStrictEqual(success(0))
    })

    it('string values', () => {
      expect(decoder.decode(Number, '1')).toStrictEqual(success(1))
      expect(decoder.decode(Number, '-1')).toStrictEqual(success(-1))
      expect(decoder.decode(Number, '0')).toStrictEqual(success(0))
      expect(decoder.decode(Number, 'string')).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Number',
            value: 'string',
            paths: [],
            rule: 'number',
          }),
        ]),
      )
    })

    it('null & undefined', () => {
      expect(decoder.decode(Number, null)).toStrictEqual(
        failure([
          new ValidationError({
            message: 'missing value',
            value: null,
            paths: [],
            rule: 'required',
          }),
        ]),
      )
      expect(decoder.decode(Number, undefined)).toStrictEqual(
        failure([
          new ValidationError({
            message: 'missing value',
            value: undefined,
            paths: [],
            rule: 'required',
          }),
        ]),
      )
    })

    it('object values', () => {
      expect(decoder.decode(Number, { foo: 'bar' })).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Number',
            value: { foo: 'bar' },
            paths: [],
            rule: 'number',
          }),
        ]),
      )
    })

    it('array values', () => {
      expect(decoder.decode(Number, ['100'])).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Number',
            value: ['100'],
            paths: [],
            rule: 'number',
          }),
        ]),
      )
      expect(decoder.decode(Number, [100])).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Number',
            value: [100],
            paths: [],
            rule: 'number',
          }),
        ]),
      )
    })
  })

  describe('string', () => {
    const schema = String

    it('boolean values', () => {
      expect(decoder.decode(schema, true)).toStrictEqual(success('true'))
      expect(decoder.decode(schema, false)).toStrictEqual(success('false'))
    })

    it('number values', () => {
      expect(decoder.decode(schema, 1)).toStrictEqual(success('1'))
      expect(decoder.decode(schema, -1)).toStrictEqual(success('-1'))
      expect(decoder.decode(schema, 0)).toStrictEqual(success('0'))
    })

    it('string values', () => {
      expect(decoder.decode(schema, 'string')).toStrictEqual(success('string'))
    })

    it('null & undefined', () => {
      expect(decoder.decode(schema, null)).toStrictEqual(
        failure([
          new ValidationError({
            message: 'missing value',
            value: null,
            paths: [],
            rule: 'required',
          }),
        ]),
      )
      expect(decoder.decode(schema, undefined)).toStrictEqual(
        failure([
          new ValidationError({
            message: 'missing value',
            value: undefined,
            paths: [],
            rule: 'required',
          }),
        ]),
      )
    })

    it('object values', () => {
      expect(decoder.decode(schema, { foo: 'bar' })).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for String',
            value: { foo: 'bar' },
            paths: [],
            rule: 'string',
          }),
        ]),
      )
    })

    it('array values', () => {
      expect(decoder.decode(schema, ['string'])).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for String',
            value: ['string'],
            paths: [],
            rule: 'string',
          }),
        ]),
      )
    })
  })

  describe('bigint', () => {
    const schema = BigInt

    it('boolean values', () => {
      expect(decoder.decode(schema, true)).toStrictEqual(success(BigInt(1)))
      expect(decoder.decode(schema, false)).toStrictEqual(success(BigInt(0)))
    })

    it('number values', () => {
      expect(decoder.decode(schema, 1)).toStrictEqual(success(BigInt(1)))
      expect(decoder.decode(schema, -1)).toStrictEqual(success(BigInt(-1)))
      expect(decoder.decode(schema, 0)).toStrictEqual(success(BigInt(0)))
    })

    it('string values', () => {
      expect(decoder.decode(schema, '1')).toStrictEqual(success(BigInt(1)))
      expect(decoder.decode(schema, '-1')).toStrictEqual(success(BigInt(-1)))
      expect(decoder.decode(schema, '0')).toStrictEqual(success(BigInt(0)))
      expect(decoder.decode(schema, 'string')).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Integer',
            value: 'string',
            paths: [],
            rule: 'integer',
          }),
        ]),
      )
    })

    it('null & undefined', () => {
      expect(decoder.decode(schema, null)).toStrictEqual(
        failure([
          new ValidationError({
            message: 'missing value',
            value: null,
            paths: [],
            rule: 'required',
          }),
        ]),
      )
      expect(decoder.decode(schema, undefined)).toStrictEqual(
        failure([
          new ValidationError({
            message: 'missing value',
            value: undefined,
            paths: [],
            rule: 'required',
          }),
        ]),
      )
    })

    it('object values', () => {
      expect(decoder.decode(schema, { foo: 'bar' })).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Integer',
            value: { foo: 'bar' },
            paths: [],
            rule: 'integer',
          }),
        ]),
      )
    })

    it('array values', () => {
      expect(decoder.decode(schema, ['string'])).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Integer',
            value: ['string'],
            paths: [],
            rule: 'integer',
          }),
        ]),
      )
    })
  })

  describe('date', () => {
    const validate = (i: JsonValue) => decoder.decode(resolveSchema(Date), i)

    it('valid values', () => {
      expect(validate('2000-01-01')).toStrictEqual(
        success(new Date(Date.UTC(2000, 0, 1))),
      )
      expect(validate('2000-01-01T01:01:01Z')).toStrictEqual(
        success(new Date(Date.UTC(2000, 0, 1, 1, 1, 1))),
      )
    })

    it('invalid values', () => {
      expect(validate(true)).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Date',
            value: true,
            paths: [],
            rule: 'Date',
          }),
        ]),
      )

      expect(validate('string')).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Date',
            value: 'string',
            paths: [],
            rule: 'Date',
          }),
        ]),
      )
    })
  })

  describe('validate enum', () => {
    enum Color {
      Red = 'Red',
      Green = 'Green',
      Blue = 'Blue',
    }

    const validate = (i: JsonValue) => decoder.decode(Enum(Color), i)

    it('valid values', () => {
      expect(validate('Red')).toStrictEqual(success('Red'))
      expect(validate('Green')).toStrictEqual(success('Green'))
      expect(validate('Blue')).toStrictEqual(success('Blue'))
    })

    it('invalid values', () => {
      expect(validate(true)).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Enum',
            value: true,
            paths: [],
            rule: 'enum',
          }),
        ]),
      )

      expect(validate({})).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Enum',
            value: {},
            paths: [],
            rule: 'enum',
          }),
        ]),
      )

      expect(validate(['Red'])).toStrictEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Enum',
            value: ['Red'],
            paths: [],
            rule: 'enum',
          }),
        ]),
      )
    })
  })

  describe('validate optional', () => {
    const validate = (i: JsonValue) => decoder.decode(Optional(String), i)

    it('valid values', () => {
      expect(validate(1)).toEqual(success('1'))
      expect(validate(true)).toEqual(success('true'))
      expect(validate('string')).toEqual(success('string'))
      expect(validate(undefined)).toEqual(success(undefined))
    })

    it('invalid values', () => {
      expect(validate(null)).toEqual(
        failure([
          new ValidationError({
            message: 'missing value',
            value: null,
            paths: [],
            rule: 'required',
          }),
        ]),
      )
      expect(validate({})).toEqual(
        failure([
          new ValidationError({
            message: 'invalid value for String',
            value: {},
            paths: [],
            rule: 'string',
          }),
        ]),
      )
    })
  })

  describe('validate nullable', () => {
    const decoder = new JsonCodec()
    const validate = (i: JsonValue) => decoder.decode(Nullable(String), i)

    it('valid values', () => {
      expect(validate(1)).toEqual(success('1'))
      expect(validate(true)).toEqual(success('true'))
      expect(validate('string')).toEqual(success('string'))
      expect(validate(null)).toEqual(success(null))
    })

    it('invalid values', () => {
      expect(validate(undefined)).toEqual(
        failure([
          new ValidationError({
            message: 'missing value',
            value: undefined,
            paths: [],
            rule: 'required',
          }),
        ]),
      )
      expect(validate({})).toEqual(
        failure([
          new ValidationError({
            message: 'invalid value for String',
            value: {},
            paths: [],
            rule: 'string',
          }),
        ]),
      )
    })
  })

  describe('validate list', () => {
    const decoder = new JsonCodec()
    const validate = (i: JsonValue) => decoder.decode(List(String), i)

    it('valid values', () => {
      expect(validate(1)).toEqual(success(['1']))
      expect(validate(true)).toEqual(success(['true']))
      expect(validate('string')).toEqual(success(['string']))
      expect(validate(['foo', 'bar'])).toEqual(success(['foo', 'bar']))
      expect(validate(['foo', 1, false])).toEqual(
        success(['foo', '1', 'false']),
      )
    })

    it('invalid values', () => {
      expect(validate({})).toEqual(
        failure([
          new ValidationError({
            message: 'invalid value for String',
            value: {},
            paths: [0],
            rule: 'string',
          }),
        ]),
      )

      expect(validate(['string', {}])).toEqual(
        failure([
          new ValidationError({
            message: 'invalid value for String',
            value: {},
            paths: [1],
            rule: 'string',
          }),
        ]),
      )
    })
  })

  describe('validate dictionary', () => {
    const decoder = new JsonCodec()
    const validate = (i: JsonValue) => decoder.decode(Dictionary(String), i)

    it('valid values', () => {
      expect(validate({})).toEqual(success({}))
      expect(validate({ foo0: 'bar' })).toEqual(success({ foo0: 'bar' }))
      expect(validate({ foo0: 'bar', foo1: false, foo2: 100 })).toEqual(
        success({ foo0: 'bar', foo1: 'false', foo2: '100' }),
      )
    })

    it('invalid values', () => {
      expect(validate(['foo'])).toEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Dictionary',
            value: ['foo'],
            paths: [],
            rule: 'dictionary',
          }),
        ]),
      )

      expect(validate({ foo: 'string', bar: {} })).toEqual(
        failure([
          new ValidationError({
            message: 'invalid value for String',
            value: {},
            paths: ['bar'],
            rule: 'string',
          }),
        ]),
      )
    })
  })

  describe('validate tuple', () => {
    const decoder = new JsonCodec()
    const validate = (i: JsonValue) =>
      decoder.decode(Tuple(String, Number, Boolean), i)

    it('valid values', () => {
      expect(validate(['string', 10, false])).toEqual(
        success(['string', 10, false]),
      )
      expect(validate(['string', '10', 'false'])).toEqual(
        success(['string', 10, false]),
      )
      expect(validate(['string', '10', 0])).toEqual(
        success(['string', 10, false]),
      )
    })

    it('invalid values', () => {
      expect(validate('string')).toEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Tuple',
            value: 'string',
            paths: [],
            rule: 'tuple',
          }),
        ]),
      )

      expect(validate(['string', 1])).toEqual(
        failure([
          new ValidationError({
            message: 'invalid length for Tuple',
            value: ['string', 1],
            paths: [],
            rule: 'tuple.length',
          }),
        ]),
      )

      expect(validate(['string', 1, 'string'])).toEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Boolean',
            value: 'string',
            paths: [2],
            rule: 'boolean',
          }),
        ]),
      )
    })
  })

  describe('validate object', () => {
    class B {
      @Property(String)
      public readonly foo!: string
    }

    class A {
      @Property(String)
      public readonly foo!: string

      @Property(Number)
      public readonly bar!: number

      @Property(B)
      public readonly nested!: B
    }

    const validate = (i: JsonValue) => decoder.decode(A, i)

    it('valid values', () => {
      expect(
        validate({ foo: 'foo', bar: 10, nested: { foo: 'string' } }),
      ).toEqual(success({ foo: 'foo', bar: 10, nested: { foo: 'string' } }))

      expect(validate({ foo: 'foo', bar: 10, nested: { foo: 10 } })).toEqual(
        success({ foo: 'foo', bar: 10, nested: { foo: '10' } }),
      )

      expect(
        validate({
          foo: 'foo',
          bar: 10,
          nested: { foo: 10 },
          additional: 'foo',
        }),
      ).toEqual(success({ foo: 'foo', bar: 10, nested: { foo: '10' } }))
    })

    it('invalid values', () => {
      expect(validate('string')).toEqual(
        failure([
          new ValidationError({
            message: 'invalid value for Object',
            value: 'string',
            paths: [],
            rule: 'object',
          }),
        ]),
      )

      expect(validate({ foo: 'foo', bar: 10, nested: { foo: {} } })).toEqual(
        failure([
          new ValidationError({
            message: 'invalid value for String',
            value: {},
            paths: ['nested', 'foo'],
            rule: 'string',
          }),
        ]),
      )
    })
  })

  describe('validate TaggedUnion', () => {
    const unionSchema = TaggedUnion({
      foo: String,
      bar: Number,
    })
    const validate = (i: JsonValue) => decoder.decode(unionSchema, i)

    it('valid values', () => {
      expect(validate({ type: 'foo', foo: 'string' })).toEqual(
        success({ type: 'foo', foo: 'string' }),
      )

      expect(validate({ type: 'bar', bar: 10 })).toEqual(
        success({ type: 'bar', bar: 10 }),
      )
    })

    it('invalid values', () => {
      expect(validate('string')).toEqual(
        failure([
          new ValidationError({
            message: 'invalid value for TaggedUnion',
            value: 'string',
            paths: [],
            rule: 'taggedUnion',
          }),
        ]),
      )

      expect(validate({ type: 'foo', foo: {} })).toEqual(
        failure([
          new ValidationError({
            message: 'invalid value for String',
            value: {},
            paths: ['foo'],
            rule: 'string',
          }),
        ]),
      )

      expect(validate({ type: 'foo', bar: 100 })).toEqual(
        failure([
          new ValidationError({
            message: 'missing value',
            value: undefined,
            paths: ['foo'],
            rule: 'required',
          }),
        ]),
      )
    })
  })
})

describe('encode', () => {
  const encoder = new JsonCodec()

  it('primitives', () => {
    expect(encoder.encode(Boolean, true)).toEqual(true)
    expect(encoder.encode(String, 'string')).toEqual('string')
    expect(encoder.encode(Number, 100)).toEqual(100)
  })

  it('bigint', () => {
    expect(encoder.encode(BigInt, BigInt('1000000000000000000000000'))).toEqual(
      '1000000000000000000000000',
    )
  })

  it('Date', () => {
    expect(
      encoder.encode(Date, new Date(Date.UTC(2020, 0, 1, 12, 30, 30))),
    ).toEqual('2020-01-01T12:30:30.000Z')
  })

  it('Buffer', () => {
    expect(encoder.encode(Buffer, Buffer.from('deadbeef', 'base64'))).toEqual(
      'deadbeef',
    )
  })

  it('ArrayBuffer', () => {
    expect(
      encoder.encode(ArrayBuffer, Buffer.from('deadbeef', 'base64')),
    ).toEqual('deadbeef')
  })

  it('URL', () => {
    expect(encoder.encode(URL, new URL('http://localhost'))).toEqual(
      'http://localhost/',
    )
    expect(
      encoder.encode(URL, new URL('./foo.html', 'http://localhost')),
    ).toEqual('http://localhost/foo.html')
  })

  it('List', () => {
    expect(encoder.encode(List(String), ['foo', 'bar'])).toEqual(['foo', 'bar'])
  })

  it('Optional', () => {
    expect(encoder.encode(Optional(String), 'foo')).toEqual('foo')
    expect(encoder.encode(Optional(String), undefined)).toEqual(undefined)
  })

  it('Nullable', () => {
    expect(encoder.encode(Nullable(String), 'foo')).toEqual('foo')
    expect(encoder.encode(Nullable(String), null)).toEqual(null)
  })
})
