import { Brand, IBrandSchema, ResolveBrand } from '@cogitatio/core'

export const emailSymbol = Symbol('email')

export const Email: IBrandSchema<string, typeof emailSymbol, true> = Brand(
  String,
  emailSymbol,
)

export type Email = ResolveBrand<typeof Email>

export const uriSymbol = Symbol('uri')

export const Uri: IBrandSchema<string, typeof uriSymbol, true> = Brand(
  String,
  uriSymbol,
)

export type Uri = ResolveBrand<typeof Uri>

export const integerSymbol = Symbol('integer')

export const Integer: IBrandSchema<number, typeof integerSymbol, true> = Brand(
  Number,
  integerSymbol,
)

export type Integer = ResolveBrand<typeof Integer>

export const portSymbol = Symbol('port')

export const Port: IBrandSchema<Integer, typeof portSymbol, true> = Brand(
  Integer,
  portSymbol,
)

export type Port = ResolveBrand<typeof Port>

export const ipSymbol = Symbol('ip')

export const Ip: IBrandSchema<string, typeof ipSymbol, true> = Brand(
  String,
  ipSymbol,
)

export type Ip = ResolveBrand<typeof Ip>

export const hostnameSymbol = Symbol('hostname')

export const Hostname: IBrandSchema<
  string,
  typeof hostnameSymbol,
  true
> = Brand(String, hostnameSymbol)

export type Hostname = ResolveBrand<typeof Hostname>

export const uuidSymbol = Symbol('uuid')

export const Uuid: IBrandSchema<string, typeof uuidSymbol, true> = Brand(
  String,
  uuidSymbol,
)

export type Uuid = ResolveBrand<typeof Uuid>

export { IEncoder, IDecoder, ICodec } from './codec'

export { Id } from './id'
