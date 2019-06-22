import 'jest'

import {
  Dictionary,
  Enum,
  List,
  Nullable,
  Optional,
  Property,
  resolveSchema,
  Tuple,
} from '@anzenjs/core'
import assert from 'assert'
import { JoiDecoder } from '../src'

describe('validate primitive', () => {
  const decoder = new JoiDecoder()

  describe('boolean', () => {
    const validate = decoder.decode(resolveSchema(Boolean))

    it('should failed with non-boolean value', () => {
      assert.throws(() => validate(0))
      assert.throws(() => validate({}))
      assert.throws(() => validate('foo'))
      assert.throws(() => validate(100n))
    })

    it('should success with boolean value', () => {
      assert.equal(true, validate('true'))
      assert.equal(false, validate('false'))
      assert.equal(true, validate(true))
      assert.equal(false, validate(false))
    })
  })

  describe('number', () => {
    const validate = decoder.decode(resolveSchema(Number))

    it('should failed with non-number value', () => {
      assert.throws(() => validate({}))
      assert.throws(() => validate('foo'))
      assert.throws(() => validate(100n))
    })

    it('should success with number value', () => {
      assert.equal(1, validate('1'))
      assert.equal(1.1, validate('1.1'))
      assert.equal(1.1, validate(1.1))
      assert.equal(1, validate(1))
    })
  })

  describe('string', () => {
    const validate = decoder.decode(resolveSchema(String))

    it('should failed with non-string value', () => {
      assert.throws(() => validate(0))
      assert.throws(() => validate({}))
      assert.throws(() => validate(false))
      assert.throws(() => validate(100n))
    })

    it('should success with string value', () => {
      assert.equal('foo', validate('foo'))
    })
  })

  describe('bigint', () => {
    const validate = decoder.decode(resolveSchema(String))

    it('should failed with any value', () => {
      assert.throws(() => validate(0))
      assert.throws(() => validate({}))
      assert.throws(() => validate(false))
      assert.throws(() => validate(100n))
    })
  })

  describe('date', () => {
    const validate = decoder.decode(resolveSchema(Date))

    it('should failed with invalid date value', () => {
      assert.throws(() => validate({}))
      assert.throws(() => validate('foo'))
      assert.throws(() => validate(false))
      assert.throws(() => validate(100n))
    })

    it('should success with date value', () => {
      const date = new Date(2019, 0, 1)
      assert.deepStrictEqual(date, validate(date))
      assert.deepStrictEqual(date, validate(date.toISOString()))
      assert.deepStrictEqual(date, validate(date.getTime()))
    })
  })

  describe('binary', () => {
    const validate = decoder.decode(resolveSchema(Buffer))

    it('should failed with invalid array buffer value', () => {
      assert.throws(() => validate({}))
      assert.throws(() => validate(false))
      assert.throws(() => validate(100n))
    })

    it('should success with buffer value', () => {
      const buffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8])

      assert.deepStrictEqual(buffer, validate(buffer))
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
  const validate = decoder.decode(Enum(Color))

  it('should failed with invalid enum value', () => {
    assert.throws(() => validate('red'))
    assert.throws(() => validate(1))
    assert.throws(() => validate({}))
  })

  it('should success with enum & string value', () => {
    assert.equal(Color.Red, validate(Color.Red))
    assert.equal(Color.Red, validate('Red'))
    assert.equal(Color.Green, validate(Color.Green))
  })
})

describe('validate optional', () => {
  const decoder = new JoiDecoder()
  const validate = decoder.decode(Optional(String))

  it('should failed with non-string or undefined value', () => {
    assert.throws(() => validate(0))
    assert.throws(() => validate({}))
    assert.throws(() => validate(false))
    assert.throws(() => validate(100n))
    assert.throws(() => validate(null))
  })

  it('should success with string or undefined value', () => {
    assert.equal('foo', validate('foo'))
    assert.equal(undefined, validate(undefined))
  })
})

describe('validate nullable', () => {
  const decoder = new JoiDecoder()
  const validate = decoder.decode(Nullable(String))

  it('should failed with non-string or null value', () => {
    assert.throws(() => validate(0))
    assert.throws(() => validate({}))
    assert.throws(() => validate(false))
    assert.throws(() => validate(100n))
    assert.throws(() => validate(undefined))
  })

  it('should success with string or null value', () => {
    assert.equal('foo', validate('foo'))
    assert.equal(null, validate(null))
  })
})

describe('validate list', () => {
  const decoder = new JoiDecoder()
  const validate = decoder.decode(List(String))

  it('should failed with non string array value', () => {
    assert.throws(() => validate(0))
    assert.throws(() => validate({}))
    assert.throws(() => validate(false))
    assert.throws(() => validate(100n))
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
  const validate = decoder.decode(Dictionary(String))

  it('should failed with non string dictionaary value', () => {
    assert.throws(() => validate(0))
    assert.throws(() => validate(false))
    assert.throws(() => validate(100n))
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
  const validate = decoder.decode(Tuple(String, Number))

  it('should failed with invalid tuple value', () => {
    assert.throws(() => validate(0))
    assert.throws(() => validate({}))
    assert.throws(() => validate(false))
    assert.throws(() => validate(100n))
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
  const validate = decoder.decode(resolveSchema(A))

  it('should failed with invalid tuple value', () => {
    assert.throws(() => validate(0))
    assert.throws(() => validate({}))
    assert.throws(() => validate(false))
    assert.throws(() => validate(100n))
    assert.throws(() => validate(undefined))
    assert.throws(() => validate([10]))
    assert.throws(() => validate([]))
  })

  it('should success with correct tuple value', () => {
    assert.deepStrictEqual(
      {
        foo: 'foo',
        bar: 10,
      },
      validate({ foo: 'foo', bar: 10 }),
    )
  })
})
