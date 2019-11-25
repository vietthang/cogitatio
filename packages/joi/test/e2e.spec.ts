import 'jest'

import {
  Decoder,
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
import assert from 'assert'
import { JoiDecoder } from '../src'

describe('validate primitive', () => {
  const decoder = new JoiDecoder()

  describe('boolean', () => {
    const validate = (i: unknown) => decoder.decode(resolveSchema(Boolean), i)

    it('should failed with non-boolean value', () => {
      assert.throws(() => validate(0))
      assert.throws(() => validate({}))
      assert.throws(() => validate('foo'))
      assert.throws(() => validate(BigInt(100)))
    })

    it('should success with boolean value', () => {
      assert.strictEqual(true, validate('true'))
      assert.strictEqual(false, validate('false'))
      assert.strictEqual(true, validate(true))
      assert.strictEqual(false, validate(false))
    })
  })

  describe('number', () => {
    const validate = (i: unknown) => decoder.decode(resolveSchema(Number), i)

    it('should failed with non-number value', () => {
      assert.throws(() => validate({}))
      assert.throws(() => validate('foo'))
      assert.throws(() => validate(BigInt(100)))
    })

    it('should success with number value', () => {
      assert.strictEqual(1, validate('1'))
      assert.strictEqual(1.1, validate('1.1'))
      assert.strictEqual(1.1, validate(1.1))
      assert.strictEqual(1, validate(1))
    })
  })

  describe('string', () => {
    const validate = (i: unknown) => decoder.decode(resolveSchema(String), i)

    it('should failed with non-string value', () => {
      assert.throws(() => validate(0))
      assert.throws(() => validate({}))
      assert.throws(() => validate(false))
      assert.throws(() => validate(BigInt(100)))
    })

    it('should success with string value', () => {
      assert.strictEqual('foo', validate('foo'))
    })
  })

  describe('bigint', () => {
    const validate = (i: unknown) => decoder.decode(resolveSchema(BigInt), i)

    it('should failed with any value', () => {
      assert.throws(() => validate({}))
      assert.throws(() => validate(1.1))
      assert.throws(() => validate('1.1'))
      assert.throws(() => validate('a'))
    })

    it('should success with valid string & number value', () => {
      assert.strictEqual(BigInt(0), validate(0))
      assert.strictEqual(BigInt(0), validate(false))
      assert.strictEqual(BigInt(1), validate('1'))
      assert.strictEqual(BigInt(100), validate(BigInt(100)))
    })
  })

  describe('date', () => {
    const validate = (i: unknown) => decoder.decode(resolveSchema(Date), i)

    it('should failed with invalid date value', () => {
      assert.throws(() => validate({}))
      assert.throws(() => validate('foo'))
      assert.throws(() => validate(false))
      assert.throws(() => validate(BigInt(100)))
    })

    it('should success with date value', () => {
      const date = new Date(2019, 0, 1)
      assert.deepStrictEqual(date, validate(date))
      assert.deepStrictEqual(date, validate(date.toISOString()))
      assert.deepStrictEqual(date, validate(date.getTime()))
    })
  })

  describe('binary', () => {
    const validate = (i: unknown) => decoder.decode(resolveSchema(Buffer), i)

    it('should failed with invalid array buffer value', () => {
      assert.throws(() => validate({}))
      assert.throws(() => validate(false))
      assert.throws(() => validate(BigInt(100)))
    })

    it('should success with buffer value', () => {
      const buffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8])

      assert.deepStrictEqual(buffer, validate(buffer))
    })
  })

  describe('regex', () => {
    const validate = (i: unknown) => decoder.decode(resolveSchema(RegExp), i)

    it('should failed with invalid array buffer value', () => {
      assert.throws(() => validate({}))
      assert.throws(() => validate(false))
      assert.throws(() => validate(BigInt(100)))
    })

    it('should success with buffer value', () => {
      const regex = /a/

      assert.deepStrictEqual(regex, validate(regex))
    })
  })
})

describe('validate enum', () => {
  enum Color {
    Red = 'Red',
    Green = 'Green',
    Blue = 'Blue',
  }

  const decoder = new JoiDecoder()
  const validate = (i: unknown) => decoder.decode(Enum(Color), i)

  it('should failed with invalid enum value', () => {
    assert.throws(() => validate('red'))
    assert.throws(() => validate(1))
    assert.throws(() => validate({}))
  })

  it('should success with enum & string value', () => {
    assert.strictEqual(Color.Red, validate(Color.Red))
    assert.strictEqual(Color.Red, validate('Red'))
    assert.strictEqual(Color.Green, validate(Color.Green))
  })
})

describe('validate optional', () => {
  const decoder = new JoiDecoder()
  const validate = (i: unknown) => decoder.decode(Optional(String), i)

  it('should failed with non-string or undefined value', () => {
    assert.throws(() => validate(0))
    assert.throws(() => validate({}))
    assert.throws(() => validate(false))
    assert.throws(() => validate(BigInt(100)))
    assert.throws(() => validate(null))
  })

  it('should success with string or undefined value', () => {
    assert.strictEqual('foo', validate('foo'))
    assert.strictEqual(undefined, validate(undefined))
  })
})

describe('validate nullable', () => {
  const decoder = new JoiDecoder()
  const validate = (i: unknown) => decoder.decode(Nullable(String), i)

  it('should failed with non-string or null value', () => {
    assert.throws(() => validate(0))
    assert.throws(() => validate({}))
    assert.throws(() => validate(false))
    assert.throws(() => validate(BigInt(100)))
    assert.throws(() => validate(undefined))
  })

  it('should success with string or null value', () => {
    assert.strictEqual('foo', validate('foo'))
    assert.strictEqual(null, validate(null))
  })
})

describe('validate list', () => {
  const decoder = new JoiDecoder()
  const validate = (i: unknown) => decoder.decode(List(String), i)

  it('should failed with non string array value', () => {
    assert.throws(() => validate(0))
    assert.throws(() => validate({}))
    assert.throws(() => validate(false))
    assert.throws(() => validate(BigInt(100)))
    assert.throws(() => validate(undefined))
    assert.throws(() => validate([10]))
  })

  it('should success with string array value', () => {
    assert.deepStrictEqual(['foo'], validate(['foo']))
    assert.deepStrictEqual([], validate([]))
  })
})

describe('validate dictionary', () => {
  const decoder = new JoiDecoder()
  const validate = (i: unknown) => decoder.decode(Dictionary(String), i)

  it('should failed with non string dictionaary value', () => {
    assert.throws(() => validate(0))
    assert.throws(() => validate(false))
    assert.throws(() => validate(BigInt(100)))
    assert.throws(() => validate(undefined))
    assert.throws(() => validate([10]))
    assert.throws(() => validate(['foo']))
    assert.throws(() => validate({ foo: 10 }))
  })

  it('should success with string dictionary value', () => {
    assert.deepStrictEqual({}, validate({}))
    assert.deepStrictEqual({ foo: 'foo' }, validate({ foo: 'foo' }))
  })
})

describe('validate tuple', () => {
  const decoder = new JoiDecoder()
  const validate = (i: unknown) => decoder.decode(Tuple(String, Number), i)

  it('should failed with invalid tuple value', () => {
    assert.throws(() => validate(0))
    assert.throws(() => validate({}))
    assert.throws(() => validate(false))
    assert.throws(() => validate(BigInt(100)))
    assert.throws(() => validate(undefined))
    assert.throws(() => validate([10]))
    assert.throws(() => validate([]))
  })

  it('should success with correct tuple value', () => {
    assert.deepStrictEqual(['foo', 10], validate(['foo', 10]))
  })
})

describe('validate object', () => {
  class A {
    @Property(String)
    public readonly foo!: string

    @Property(Number)
    public readonly bar!: number
  }

  const decoder = new JoiDecoder()
  const validate = (i: unknown) => decoder.decode(A, i)

  it('should failed with invalid object value', () => {
    assert.throws(() => validate(0))
    assert.throws(() => validate({}))
    assert.throws(() => validate(false))
    assert.throws(() => validate(BigInt(100)))
    assert.throws(() => validate(undefined))
    assert.throws(() => validate([10]))
    assert.throws(() => validate([]))
  })

  it('should success with correct object value', () => {
    assert.deepStrictEqual(
      {
        foo: 'foo',
        bar: 10,
      },
      validate({ foo: 'foo', bar: 10 }),
    )
  })
})

describe('validate TaggedUnion', () => {
  const decoder: Decoder<unknown> = new JoiDecoder()

  const unionSchema = TaggedUnion('kind', {
    foo: String,
    bar: Number,
  })
  const validate = (i: unknown) => decoder.decode(unionSchema, i)

  assert.throws(() => validate({}))
  assert.throws(() => validate({ foo: 'string', bar: 0 }))
  assert.throws(() => validate({ kind: 'foo', bar: 0 }))
  assert.throws(() => validate({ kind: 'foo', foo: 0 }))
  assert.throws(() => validate({ kind: 'bar', bar: 'bar' }))

  expect(validate({ kind: 'foo', foo: 'str' })).toStrictEqual({
    kind: 'foo',
    foo: 'str',
  })
  expect(validate({ kind: 'bar', bar: 0 })).toStrictEqual({
    kind: 'bar',
    bar: 0,
  })
  expect(validate({ kind: 'bar', bar: '0' })).toStrictEqual({
    kind: 'bar',
    bar: 0,
  })
})
