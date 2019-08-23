import 'jest'

import { List, Optional } from '@cogitatio/core'
import { PhoneFormat, PhoneNumber } from '@cogitatio/extra'
import { JoiDecoder } from './decoder'
import {
  bigIntPlugin,
  emptyPlugin,
  phonePlugin,
  regexPlugin,
  singleArrayPlugin,
} from './plugins'

describe('test emptyPlugin', () => {
  const schema = Optional(String)

  it('without plugin', () => {
    const decoder = new JoiDecoder()

    expect(() => decoder.decode(schema, null)).toThrow()
    expect(decoder.decode(schema, undefined)).toEqual(undefined)
  })

  it('with plugin', () => {
    const decoder = new JoiDecoder([emptyPlugin])

    expect(decoder.decode(schema, null)).toEqual(undefined)
    expect(decoder.decode(schema, '')).toEqual(undefined)
    expect(decoder.decode(schema, undefined)).toEqual(undefined)
    expect(decoder.decode(schema, 'foo')).toEqual('foo')
  })
})

describe('test singleArrayPlugin', () => {
  const schema = List(String)

  it('without plugin', () => {
    const decoder = new JoiDecoder()

    expect(() => decoder.decode(schema, 'foo')).toThrow()
  })

  it('with plugin', () => {
    const decoder = new JoiDecoder([singleArrayPlugin])

    expect(decoder.decode(schema, 'foo')).toEqual(['foo'])
  })
})

describe('test bigintPlugin', () => {
  const schema = BigInt

  it('without plugin', () => {
    const decoder = new JoiDecoder()

    expect(() => decoder.decode(schema, 100)).toThrow()
  })

  it('with plugin', () => {
    const decoder = new JoiDecoder([bigIntPlugin])

    expect(decoder.decode(schema, 100)).toStrictEqual(BigInt(100))
  })
})

describe('test regexPlugin', () => {
  const schema = RegExp

  it('without plugin', () => {
    const decoder = new JoiDecoder()

    expect(() => decoder.decode(schema, '/a/')).toThrow()
  })

  it('with plugin', () => {
    const decoder = new JoiDecoder([regexPlugin])

    expect(decoder.decode(schema, '/a/')).toStrictEqual(RegExp('/a/'))
  })
})

describe('test phoneNumber', () => {
  const schema = PhoneNumber('VN', PhoneFormat.e164)

  it('without plugin', () => {
    const decoder = new JoiDecoder()

    expect(() => decoder.decode(schema, '090777777')).toThrow()
  })

  it('with plugin', () => {
    const decoder = new JoiDecoder([phonePlugin])

    expect(decoder.decode(schema, '090777777')).toStrictEqual('+8490777777')
    expect(() => decoder.decode(schema, 'invalid')).toThrow()
  })
})
