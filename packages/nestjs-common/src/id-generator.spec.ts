import { Temporal } from '@cogitatio/tc39-temporal'
import { IdGenerator } from './id-generator'

describe('test getIdGenerator', () => {
  it('should generate fine', async () => {
    const epoch = Temporal.Absolute.fromEpochMilliseconds(Date.UTC(2000, 0))

    const idGenerator = new IdGenerator({
      epoch,
      id: BigInt(0),
    })

    const baseId = BigInt('2646880970342400000')
    for (let i = 0; i <= 0xfff; i++) {
      const expected = (baseId + BigInt(i)).toString()
      expect(
        idGenerator
          .nextId(String, {
            ioTimestamp: () =>
              Temporal.Absolute.fromEpochMilliseconds(
                Date.UTC(2020, 0, 0, 0, 0, 0, 0),
              ),
          })
          .toString(),
      ).toEqual(expected)
    }
    expect(() => idGenerator.nextId(String)).toThrowError()

    expect(
      idGenerator
        .nextId(String, {
          ioTimestamp: () =>
            Temporal.Absolute.fromEpochMilliseconds(
              Date.UTC(2020, 0, 0, 0, 0, 0, 1),
            ),
        })
        .toString(),
    ).toEqual('2646880970346594304')
    expect(
      idGenerator
        .nextId(String, {
          ioTimestamp: () =>
            Temporal.Absolute.fromEpochMilliseconds(
              Date.UTC(2020, 0, 0, 0, 0, 0, 1),
            ),
        })
        .toString(),
    ).toEqual('2646880970346594305')
  })
})
