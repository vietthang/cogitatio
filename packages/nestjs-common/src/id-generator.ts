import { Optional, Property, SchemaLike } from '@cogitatio/core'
import { internal } from '@cogitatio/errors'
import { Id64, Uint64 } from '@cogitatio/extra'
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
    schema: S,
    options: NextIdOptions = {},
  ): Id64<S> {
    const ioTimestamp = options.ioTimestamp ?? IdGenerator.defaultIoTimestamp

    const timestamp = ioTimestamp()
    const time = BigInt(
      (timestamp.getEpochMilliseconds() - this.epoch.getEpochMilliseconds()) %
        BigInt(2) ** BigInt(42),
    )

    if (time < this.lastTime) {
      throw internal({
        code: 'ID_GENERATOR_INVALID_TIMESTAMP_FUNCTION',
        message: 'invalid timestamp function',
      })
    }

    // Generates id in the same millisecond as the previous id
    if (time === this.lastTime) {
      if (this.outOfBound) {
        throw internal({
          code: 'ID_GENERATOR_OUT_OF_BOUND',
          message: 'out of bound, do you try to generate over 4096 ids in 1ms?',
        })
      }
      // Increase sequence counter
      // tslint:disable-next-line:no-bitwise
      this.seq = (this.seq + 1) & 0xfff

      // sequence counter exceeded its max value (4095)
      // - set overflow flag and wait till next millisecond
      if (this.seq === 0) {
        this.outOfBound = true
        throw internal({
          code: 'ID_GENERATOR_OUT_OF_BOUND',
          message: 'out of bound, do you try to generate over 4096 ids in 1ms?',
        })
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

    return Id64(schema)(Uint64(result))
  }
}
