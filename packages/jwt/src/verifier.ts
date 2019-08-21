import {
  Enum,
  List,
  Optional,
  Property,
  Resolve,
  SchemaLike,
} from '@cogitatio/core'
import { Default, IDecoder, Integer } from '@cogitatio/extra'
import jwt from 'jsonwebtoken'
import { JwtAlgorithm } from './common'

export class JwtVerifyConfig {
  @Property(String)
  public readonly key!: string

  @Property(List(Enum(JwtAlgorithm)), Default([JwtAlgorithm.HS256]))
  public readonly algorithms!: JwtAlgorithm[]

  @Property(Optional(List(String)))
  public readonly audience?: string[]

  @Property(Optional(Integer))
  public readonly clockTolerance?: Integer

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
    private readonly decoder: IDecoder<unknown>,
    private readonly schema: S,
    private readonly config: JwtVerifyConfig,
  ) {}

  public verify(token: string, date: Date = new Date()): Resolve<S> {
    const decoded = jwt.verify(token, this.config.key, {
      algorithms: this.config.algorithms,
      audience: this.config.audience,
      clockTolerance: this.config.clockTolerance,
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
