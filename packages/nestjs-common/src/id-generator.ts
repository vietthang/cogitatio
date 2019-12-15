import { Optional, Property, Resolve, SchemaLike } from '@cogitatio/core'
import { Id64 } from '@cogitatio/extra'
import { Temporal } from '@cogitatio/tc39-temporal'

export class IdGeneratorOptions {
  @Property(Optional(BigInt))
  public id?: bigint

  @Property(Optional(Temporal.Absolute))
  public epoch?: Temporal.Absolute
}

export interface NextIdOptions {
  ioTimestamp?: () => Temporal.Absolute
}

export class IdGenerator {
  private static defaultIoTimestamp() {
    return Temporal.now.absolute()
  }
  private readonly id: bigint
  private readonly epoch: Temporal.Absolute

  private lastTime: bigint = BigInt(0)
  private seq: number = 0
  private outOfBound = false

  constructor(options: IdGeneratorOptions = {}) {
    this.id = options.id ?? BigInt(0)
    this.epoch = options.epoch ?? Temporal.Absolute.fromEpochSeconds(0)
  }

  public nextId<S extends SchemaLike>(
    _schema: S, // only use for static type inference
    options: NextIdOptions = {},
  ): Id64<Resolve<S>> {
    const ioTimestamp = options.ioTimestamp ?? IdGenerator.defaultIoTimestamp

    const timestamp = ioTimestamp()
    const time = BigInt(
      (timestamp.getEpochMilliseconds() - this.epoch.getEpochMilliseconds()) %
        BigInt(2) ** BigInt(42),
    )

    if (time < this.lastTime) {
      throw new Error('invalid timestamp function')
    }

    // Generates id in the same millisecond as the previous id
    if (time === this.lastTime) {
      if (this.outOfBound) {
        throw new Error(
          'out of bound, do you try to generate over 4096 ids in 1ms?',
        )
      }
      // Increase sequence counter
      // tslint:disable-next-line:no-bitwise
      this.seq = (this.seq + 1) & 0xfff

      // sequence counter exceeded its max value (4095)
      // - set overflow flag and wait till next millisecond
      if (this.seq === 0) {
        this.outOfBound = true
        throw new Error(
          'out of bound, do you try to generate over 4096 ids in 1ms?',
        )
      }
    } else {
      this.seq = 0
      this.outOfBound = false
    }
    this.lastTime = time

    const result =
      BigInt(this.seq) +
      BigInt(this.id) * BigInt(2) ** BigInt(12) +
      time * BigInt(2) ** BigInt(22)

    return result.toString(10) as Id64<Resolve<S>>
  }
}
