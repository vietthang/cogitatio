import {
  Decoder,
  Enum,
  JsonValue,
  List,
  Optional,
  Property,
  Resolve,
  SchemaLike,
  ValidationError,
} from '@cogitatio/core'
import { unauthorized } from '@cogitatio/errors'
import { Default } from '@cogitatio/extra'
import { Temporal } from '@cogitatio/tc39-temporal'
import { either } from 'fp-ts'
import jwt from 'jsonwebtoken'
import { JwtAlgorithm } from './common'
import { durationToSeconds } from './utils'

export class JwtVerifyConfig {
  @Property(String)
  public readonly key!: string

  @Property(Default([JwtAlgorithm.HS256], List(Enum(JwtAlgorithm))))
  public readonly algorithms!: JwtAlgorithm[]

  @Property(Optional(List(String)))
  public readonly audience?: string[]

  @Property(Optional(Temporal.Duration))
  public readonly clockTolerance?: Temporal.Duration

  @Property(Optional(List(String)))
  public readonly issuer?: string[]

  @Property(Optional(Boolean))
  public readonly ignoreExpiration?: boolean

  @Property(Optional(Boolean))
  public readonly ignoreNotBefore?: boolean

  @Property(Optional(String))
  public readonly jwtid?: string

  @Property(Optional(String))
  public readonly subject?: string
}

export class JwtVerifier<S extends SchemaLike> {
  constructor(
    private readonly decoder: Decoder<JsonValue>,
    private readonly schema: S,
    private readonly config: JwtVerifyConfig,
  ) {}

  public verify(
    token: string,
    timestamp: Temporal.Absolute = Temporal.now.absolute(),
  ): Resolve<S> {
    let decoded: any
    try {
      decoded = jwt.verify(token, this.config.key, {
        algorithms: this.config.algorithms,
        audience: this.config.audience,
        clockTolerance:
          this.config.clockTolerance &&
          durationToSeconds(this.config.clockTolerance),
        issuer: this.config.issuer,
        ignoreExpiration: this.config.ignoreExpiration,
        ignoreNotBefore: this.config.ignoreNotBefore,
        jwtid: this.config.jwtid,
        subject: this.config.subject,
        clockTimestamp: Number(timestamp.getEpochSeconds()),
      })
    } catch (error) {
      throw unauthorized({ code: 'INVALID_JWT', origin: error })
    }

    const validation = this.decoder.decode(this.schema, decoded)
    return either.getOrElse<ValidationError[], Resolve<S>>(errors => {
      throw unauthorized({ code: 'INVALID_PAYLOAD', extra: errors })
    })(validation)
  }
}
