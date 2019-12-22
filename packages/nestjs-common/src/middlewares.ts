import { setContext, TypedKey } from './context'

export type ClientId = string & { __clientId: true }

export const ClientIdContextKey = 'clientId' as TypedKey<ClientId>

export interface ClientIdMiddlewareOptions {
  headerName?: string
}

export function clientIdMiddleware({
  headerName = 'x-client-id',
}: ClientIdMiddlewareOptions = {}) {
  return async <
    Request extends { header: (name: string) => string | undefined },
    Response,
    NextFunction extends (error?: any) => void
  >(
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
  return async <Request, Response, NextFunction extends (error?: any) => void>(
    req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
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
  return async <Request, Response, NextFunction extends (error?: any) => void>(
    req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
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
