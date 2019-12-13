import {
  Decoder,
  Enum,
  List,
  Optional,
  Property,
  Resolve,
  SchemaLike,
} from '@cogitatio/core'
import { Default } from '@cogitatio/extra'
import jwt from 'jsonwebtoken'
import { JwtAlgorithm } from './common'

export class JwtVerifyConfig {
  @Property(String)
  public readonly key!: string

  @Property(Default([JwtAlgorithm.HS256], List(Enum(JwtAlgorithm))))
  public readonly algorithms!: JwtAlgorithm[]

  @Property(Optional(List(String)))
  public readonly audience?: string[]

  @Property(Optional(BigInt))
  public readonly clockTolerance?: bigint

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
    private readonly decoder: Decoder<unknown>,
    private readonly schema: S,
    private readonly config: JwtVerifyConfig,
  ) {}

  public verify(token: string, date: Date = new Date()): Resolve<S> {
    const decoded = jwt.verify(token, this.config.key, {
      algorithms: this.config.algorithms,
      audience: this.config.audience,
      clockTolerance: Number(this.config.clockTolerance),
      issuer: this.config.issuer,
      ignoreExpiration: this.config.ignoreExpiration,
      ignoreNotBefore: this.config.ignoreNotBefore,
      jwtid: this.config.jwtid,
      subject: this.config.subject,
      clockTimestamp: Math.floor(date.getTime() / 1000),
    })
    return this.decoder.decode(this.schema, decoded)
  }
}
