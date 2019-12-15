import { Property } from '@cogitatio/core'
import { Id64, Integer } from '@cogitatio/extra'
import { memoize, objectSerializer } from '../utils'

export type Io<T> = () => T

export class GenerateIdOptions {
  @Property(Date)
  public epoch!: Date

  @Property(Integer)
  public id!: Integer
}

function nextTick(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 1)
  })
}

export interface GetIoIdArgs<T> extends GenerateIdOptions {
  name: string
  ioDate: Io<Date>
}

export const getIoId = memoize(
  <T>({ ioDate, epoch, id }: GetIoIdArgs<T>): Io<Promise<Id64<T>>> => {
    let lastTime: bigint = BigInt(0)
    let seq: number = 0
    let outOfBound = false

    const tryGenerate = async (): Promise<Id64<T>> => {
      const time = BigInt((ioDate().getTime() - epoch.getTime()) % 2 ** 42)

      // Generates id in the same millisecond as the previous id
      if (time === lastTime) {
        if (outOfBound) {
          return nextTick().then(tryGenerate)
        }
        // Increase sequence counter
        // tslint:disable-next-line:no-bitwise
        seq = (seq + 1) & 0xfff

        // sequence counter exceeded its max value (4095)
        // - set overflow flag and wait till next millisecond
        if (seq === 0) {
          outOfBound = true
          return nextTick().then(tryGenerate)
        }
      } else {
        seq = 0
        outOfBound = false
      }
      lastTime = time

      const result = BigInt(seq) + BigInt(id) * 2n ** 12n + time * 2n ** 22n

      return result.toString(10) as Id64<T>
    }

    return tryGenerate
  },
  () => global,
  ({ name, epoch, id, ioDate }) =>
    [name, epoch, id, objectSerializer(ioDate)].join('\0'),
)

export interface GetIoIdArgs<T> extends GenerateIdOptions {
  name: string
  ioDate: Io<Date>
}

export function generateId<T>(args: GetIoIdArgs<T>): Promise<Id64<T>> {
  return getIoId(args)()
}
