import {
  Decoder,
  Enum,
  List,
  Optional,
  Property,
  Resolve,
  SchemaLike,
} from '@cogitatio/core'
import { Default, Integer } from '@cogitatio/extra'
import jwt from 'jsonwebtoken'
import { JwtAlgorithm } from './common'

export class JwtSignConfig {
  @Property(String)
  public readonly key!: string

  @Property(Enum(JwtAlgorithm), Default(JwtAlgorithm.HS256))
  public readonly algorithm!: JwtAlgorithm

  @Property(Optional(String))
  public readonly keyid?: string

  @Property(Optional(Integer))
  public readonly expiresIn?: Integer

  @Property(Optional(Integer))
  public readonly notBefore?: Integer

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
    private readonly decoder: Decoder<unknown>,
    private readonly config: JwtSignConfig,
  ) {}

  public sign(payload: Resolve<S>, date: Date = new Date()): string {
    return jwt.sign(
      {
        iat: Math.floor(date.getTime() / 1000),
        ...this.decoder.decode(this.schema, payload),
      },
      this.config.key,
      {
        algorithm: this.config.algorithm,
        keyid: this.config.keyid,
        expiresIn: this.config.notBefore,
        audience: this.config.audience,
        issuer: this.config.issuer,
        jwtid: this.config.jwtid,
        noTimestamp: this.config.noTimestamp,
        encoding: this.config.encoding,
      },
    )
  }
}
