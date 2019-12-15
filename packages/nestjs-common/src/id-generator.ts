import { Optional, Property } from '@cogitatio/core'
import { Id64 } from '@cogitatio/extra'
import { Absolute } from 'cogitatio-tc39-temporal'
import FlakeIdGen from 'flake-idgen'

export class IdGeneratorOptions {
  @Property(Optional(BigInt))
  public datacenter?: bigint

  @Property(Optional(BigInt))
  public worker?: bigint

  @Property(Optional(Absolute))
  public epoch?: Absolute
}

export class IdGenerator {
  private readonly flakeIdGen: FlakeIdGen

  constructor(options: IdGeneratorOptions) {
    this.flakeIdGen = new FlakeIdGen({
      datacenter:
        options.datacenter !== undefined
          ? Number(options.datacenter)
          : undefined,
      worker: options.worker !== undefined ? Number(options.worker) : undefined,
      epoch:
        options.epoch !== undefined
          ? options.epoch.getEpochMilliseconds()
          : undefined,
    })
  }

  public nextId<T>(): Promise<Id64<T>> {
    return new Promise((resolve, reject) => {
      this.flakeIdGen.next((err, buffer) => {
        if (err) {
          return reject(err)
        }
        const int64Array = new BigInt64Array(buffer.buffer)
        const id64 = int64Array[0]
        return resolve(Id64<T>()(id64.toString()))
      })
    })
  }
}
