import 'jest'

import { Integer } from '@cogitatio/extra'
import { getIoId } from './idGenerator'

function ioFromIterable<T>(iterable: Iterable<T>): Io<T> {
  const it = iterable[Symbol.iterator]()
  return () => {
    const { value } = it.next()
    return value
  }
}

describe('test getIdGenerator', () => {
  it('should generate fine', async () => {
    const epoch = new Date(Date.UTC(2000, 0))
    const ioDate = ioFromIterable([
      ...new Array<Date>(0xfff + 20).fill(
        new Date(Date.UTC(2020, 0, 0, 0, 0, 0, 0)),
      ),
      new Date(Date.UTC(2020, 0, 0, 0, 0, 0, 1)),
      new Date(Date.UTC(2020, 0, 0, 0, 0, 0, 1)),
    ])

    const ioId = getIoId({
      name: 'A',
      epoch,
      id: 0 as Integer,
      ioDate,
    })

    const baseId = BigInt('2646880970342400000')
    for (let i = 0; i <= 0xfff; i++) {
      const expected = (baseId + BigInt(i)).toString()
      expect(await ioId()).toEqual(expected)
    }
    expect(await ioId()).toEqual('2646880970346594304')
    expect(await ioId()).toEqual('2646880970346594305')
  })
})
