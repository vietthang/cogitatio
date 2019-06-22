import 'jest'

import assert from 'assert'
import { Property, resolveSchema } from '../../core/src'
import { Default, JoiDecoder, Min } from '../src'

describe('@Min', () => {
  class A {
    @Min(5)
    @Property(Number)
    public readonly foo!: number
  }

  const joiDecoder = new JoiDecoder()
  const validate = joiDecoder.decode(resolveSchema(A))

  it('should validate', () => {
    assert.throws(() => validate({ foo: 0 }))
  })

  it('should success with valid value', () => {
    assert.deepStrictEqual({ foo: 5 }, validate({ foo: 5 }))
    assert.deepStrictEqual({ foo: 5 }, validate({ foo: '5' }))
    assert.deepStrictEqual({ foo: 5.1 }, validate({ foo: 5.1 }))
  })
})

describe('@Default', () => {
  class A {
    @Default(5)
    @Property(Number)
    public readonly foo!: number
  }

  const joiDecoder = new JoiDecoder()
  const validate = joiDecoder.decode(resolveSchema(A))

  it('should validate', () => {
    assert.throws(() => validate({ foo: null }))
  })

  it('should success with valid value', () => {
    assert.deepStrictEqual({ foo: 5 }, validate({ foo: 5 }))
    assert.deepStrictEqual({ foo: 5 }, validate({ foo: undefined }))
    assert.deepStrictEqual({ foo: 5 }, validate({}))
  })
})
