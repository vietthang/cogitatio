import { setContext } from '@cogitatio/nestjs-common'
import qs from 'querystring'
import { LoggersContextKey } from './logger'

export interface LoggerMiddlewareOptions {
  headerName?: string
}

// TODO add some kind of authorization here
export function loggerMiddleware({
  headerName = 'x-debug-logger',
}: LoggerMiddlewareOptions) {
  return async <
    Request extends { header: (name: string) => string | undefined },
    Response,
    NextFunction extends (error?: any) => void
  >(
    req: Request,
    _: Response,
    next: NextFunction,
  ) => {
    try {
      const debugValue = req.header(headerName)
      if (!debugValue) {
        return next()
      }
      const levels: { [key: string]: string | undefined } = Object.fromEntries(
        Object.entries(qs.parse(debugValue)).map(([key, value]) => {
          if (Array.isArray(value)) {
            return [key, value[0]]
          } else {
            return [key, value]
          }
        }),
      )
      await setContext(req, context =>
        context.withValue(LoggersContextKey, {
          levels,
        }),
      )
      return next()
    } catch (error) {
      return next(error)
    }
  }
}
