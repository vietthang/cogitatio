import { Ip } from '@cogitatio/extra'
import { NextFunction, Request, Response } from 'express'
import { setContext, TypedKey } from './context'

export type ClientId = string & { __clientId: true }

export const ClientIdContextKey = 'clientId' as TypedKey<ClientId>

export interface ClientIdMiddlewareOptions {
  headerName?: string
}

export function clientIdMiddleware({
  headerName = 'x-client-id',
}: ClientIdMiddlewareOptions = {}) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const clientId = req.header(headerName)
      if (!clientId) {
        return next()
      }
      await setContext(req, context =>
        context.withValue(ClientIdContextKey, clientId),
      )
      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export type RequestId = string & { __requestId: true }

export const RequestIdContextKey = 'requestId' as TypedKey<RequestId>

export interface RequestIdMiddlewareOptions {
  generator?: () => Promise<string> | string
}

async function uuidGenerator() {
  const uuid = await import('uuid')
  return uuid.v4()
}

export function requestIdMiddleware({
  generator = uuidGenerator,
}: RequestIdMiddlewareOptions = {}) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await setContext(req, async context =>
        context.withValue(ClientIdContextKey, await generator()),
      )
      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export const RequestTimeContextKey = 'requestTime' as TypedKey<Date>

export interface RequestTimeMiddlewareOptions {
  dateGenerator?: () => Promise<Date> | Date
}

function currentDateGenerator() {
  return new Date()
}

export function requestTimeMiddleware({
  dateGenerator = currentDateGenerator,
}: RequestTimeMiddlewareOptions) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await setContext(req, async context =>
        context.withValue(RequestTimeContextKey, await dateGenerator()),
      )
      return next()
    } catch (error) {
      return next(error)
    }
  }
}

function defaultUserGetter(req: unknown): unknown {
  return (req as any).user
}

export const AuthUserContextKey = 'authUser' as TypedKey<{ id: string }>

export interface AuthUseMiddlewareOptions {
  getUser?: (req: unknown) => unknown
}

export function authUserMiddleware({
  getUser = defaultUserGetter,
}: AuthUseMiddlewareOptions) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await setContext(req, async context =>
        context.withValue(AuthUserContextKey, getUser(req)),
      )
      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export interface RequestInfo {
  ip?: Ip
  userAgent?: import('useragent').Agent
}

export const RequestInfoContextKey = 'requestInfo' as TypedKey<RequestInfo>

export function requestInfoMiddleware({}: {}) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const ua = await import('useragent')
      const userAgent = ua.parse(req.header('user-agent'))

      const { getClientIp } = await import('request-ip')
      const ip = Ip(getClientIp(req))

      await setContext(req, async context =>
        context.withValue(RequestInfoContextKey, { ip, userAgent }),
      )
      return next()
    } catch (error) {
      return next(error)
    }
  }
}
