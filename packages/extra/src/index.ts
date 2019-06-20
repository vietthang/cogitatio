import { Brand, ResolveBrand } from '@anzenjs/core'

const emailSymbol = Symbol('email')

export const emailSchema = Brand(String, emailSymbol)

export type Email = ResolveBrand<typeof emailSchema>

const uriSymbol = Symbol('uri')

export const uriSchema = Brand(String, uriSymbol)

export type Uri = ResolveBrand<typeof uriSchema>

const integerSymbol = Symbol('integer')

export const integerSchema = Brand(Number, integerSymbol)

export type Integer = ResolveBrand<typeof integerSchema>

const portSymbol = Symbol('port')

export const portSchema = Brand(integerSchema, portSymbol)

export type Port = ResolveBrand<typeof portSchema>

const ipSymbol = Symbol('ip')

export const ipSchema = Brand(String, ipSymbol)

export type Ip = ResolveBrand<typeof ipSchema>

const hostnameSymbol = Symbol('hostname')

export const hostnameSchema = Brand(String, hostnameSymbol)

export type Hostname = ResolveBrand<typeof hostnameSchema>

const uuidSymbol = Symbol('uuid')

export const uuidSchema = Brand(String, uuidSymbol)

export type Uuid = ResolveBrand<typeof uuidSchema>

export { IEncoder, IDecoder, ICodec } from './codec'
