import { Optional, Property } from '@cogitatio/core'
import {
  AuthUserContextKey,
  ClientIdContextKey,
  Context,
  RequestIdContextKey,
  RequestInfoContextKey,
  RequestTimeContextKey,
} from '@cogitatio/nestjs-common'

export class SentryAdapterOptions {
  @Property(String)
  public dsn!: string

  @Property(Boolean)
  public enabled!: boolean

  @Property(Optional(String))
  public environment?: string
}

export function createSentry(
  options: SentryAdapterOptions,
): typeof import('@sentry/node') {
  const sentry: typeof import('@sentry/node') = require('@sentry/node')
  sentry.init({
    dsn: options.dsn,
    enabled: options.enabled,
    environment: options.environment,
  })
  return sentry
}

export class SentryAdapter {
  private readonly sentry: typeof import('@sentry/node') = require('@sentry/node')

  constructor(options: SentryAdapterOptions) {
    this.sentry.init({ dsn: options.dsn, enabled: options.enabled })
  }

  public captureException(context: Context, exception: unknown): void {
    Promise.resolve()
      .then(() => {
        this.sentry.configureScope(scope => {
          const user = context.value(AuthUserContextKey)
          if (user) {
            scope.setUser(user)
          }

          const requetId = context.value(RequestIdContextKey)
          if (requetId) {
            scope.setExtra('request-id', requetId)
          }

          const clientId = context.value(ClientIdContextKey)
          if (clientId) {
            scope.setExtra('client-id', clientId)
          }

          const requestTime = context.value(RequestTimeContextKey)
          if (requestTime) {
            scope.setExtra('request-time', requestTime.toISOString())
          }

          const requestInfo = context.value(RequestInfoContextKey)
          if (requestInfo) {
            scope.setExtra('request-info', requestInfo)
          }
        })
        this.sentry.captureException(exception)
      })
      .catch()
  }
}
