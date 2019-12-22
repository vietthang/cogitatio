import {
  Decoder,
  Encoder,
  Enum,
  List,
  Optional,
  Property,
  Resolve,
  SchemaLike,
} from '@cogitatio/core'
import { Default } from '@cogitatio/extra'
import { Temporal } from '@cogitatio/tc39-temporal'
import jwt from 'jsonwebtoken'
import { JsonObject, JsonValue } from '../../core/src/json/common'
import { JwtAlgorithm } from './common'

export class JwtSignConfig {
  @Property(String)
  public readonly key!: string

  @Property(Default(JwtAlgorithm.HS256, Enum(JwtAlgorithm)))
  public readonly algorithm!: JwtAlgorithm

  @Property(Optional(String))
  public readonly keyid?: string

  @Property(Optional(Temporal.Duration))
  public readonly expiresIn?: Temporal.Duration

  @Property(Optional(Temporal.Duration))
  public readonly notBefore?: Temporal.Duration

  @Property(Optional(List(String)))
  public readonly audience?: string[]

  @Property(Optional(String))
  public readonly subject?: string

  @Property(Optional(String))
  public readonly issuer?: string

  @Property(Optional(String))
  public readonly jwtid?: string

  @Property(Optional(Boolean))
  public readonly noTimestamp?: boolean

  @Property(Optional(String))
  public readonly encoding?: string
}

export class JwtSigner<S extends SchemaLike> {
  constructor(
    private readonly schema: S,
    private readonly encoder: Encoder<JsonObject>,
    private readonly config: JwtSignConfig,
  ) {}

  public sign(payload: Resolve<S>, date: Date = new Date()): string {
    return jwt.sign(
      {
        iat: Math.floor(date.getTime() / 1000),
        ...this.encoder.encode(this.schema, payload),
      },
      this.config.key,
      {
        algorithm: this.config.algorithm,
        keyid: this.config.keyid,
        expiresIn: this.config.expiresIn && this.config.expiresIn.toString(),
        notBefore: this.config.notBefore && this.config.notBefore.toString(),
        audience: this.config.audience,
        issuer: this.config.issuer,
        jwtid: this.config.jwtid,
        noTimestamp: this.config.noTimestamp,
        encoding: this.config.encoding,
      },
    )
  }
}
