import { Brand, ResolveBrand } from '@anzenjs/core'

export const emailSymbol = Symbol('email')

export const Email = Brand(String, emailSymbol)

export type Email = ResolveBrand<typeof Email>

export const uriSymbol = Symbol('uri')

export const uriSchema = Brand(String, uriSymbol)

export type Uri = ResolveBrand<typeof uriSchema>

export const integerSymbol = Symbol('integer')

export const Integer = Brand(Number, integerSymbol)

export type Integer = ResolveBrand<typeof Integer>

export const portSymbol = Symbol('port')

export const Port = Brand(Integer, portSymbol)

export type Port = ResolveBrand<typeof Port>

export const ipSymbol = Symbol('ip')

export const Ip = Brand(String, ipSymbol)

export type Ip = ResolveBrand<typeof Ip>

export const hostnameSymbol = Symbol('hostname')

export const Hostname = Brand(String, hostnameSymbol)

export type Hostname = ResolveBrand<typeof Hostname>

export const uuidSymbol = Symbol('uuid')

export const Uuid = Brand(String, uuidSymbol)

export type Uuid = ResolveBrand<typeof Uuid>

export { IEncoder, IDecoder, ICodec } from './codec'
