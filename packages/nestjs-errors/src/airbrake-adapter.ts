import { Optional, Property } from '@cogitatio/core'
import {
  AuthUserContextKey,
  ClientIdContextKey,
  Context,
  RequestIdContextKey,
  RequestInfoContextKey,
  RequestTimeContextKey,
} from '@cogitatio/nestjs-common'

export class AirbrakeAdapterOptions {
  @Property(Number)
  public projectId!: number

  @Property(String)
  public projectKey!: string

  @Property(Optional(String))
  public host?: string

  @Property(Optional(String))
  public environment?: string
}

export class AirbrakeAdapter {
  private readonly notifier: import('@airbrake/node').Notifier

  constructor(options: AirbrakeAdapterOptions) {
    const {
      Notifier,
    }: typeof import('@airbrake/node') = require('@airbrake/node')
    this.notifier = new Notifier({
      projectId: options.projectId,
      projectKey: options.projectKey,
      host: options.host,
      environment: options.environment,
    })
  }

  public captureException(context: Context, exception: unknown): void {
    Promise.resolve()
      .then(async () => {
        await this.notifier.notify({
          context: {
            'request-id': context.value(RequestIdContextKey),
            'client-id': context.value(ClientIdContextKey),
            'request-time': context.value(RequestTimeContextKey)?.toISOString(),
            'request-info': context.value(RequestInfoContextKey),
            user: context.value(AuthUserContextKey),
          },
          error: exception,
        })
      })
      .catch()
  }
}
