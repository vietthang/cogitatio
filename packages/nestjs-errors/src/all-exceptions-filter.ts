import { Optional, Property } from '@cogitatio/core'
import { formatErrorToJSON } from '@cogitatio/errors'
import { Context, getContext } from '@cogitatio/nestjs-common'
import { InjectLogger, Logger } from '@cogitatio/nestjs-logger'
import {
  ArgumentsHost,
  Catch,
  HttpException,
  Optional as NestOptional,
} from '@nestjs/common'
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core'
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql'
import { ApolloError } from 'apollo-server-core'
import { AirbrakeAdapter, AirbrakeAdapterOptions } from './airbrake-adapter'
import { SentryAdapter, SentryAdapterOptions } from './sentry-adapter'

export class ExceptionFilterOptions {
  @Property(Optional(SentryAdapterOptions))
  public readonly sentry?: SentryAdapterOptions

  @Property(Optional(AirbrakeAdapterOptions))
  public readonly airbrake?: AirbrakeAdapterOptions
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter
  implements GqlExceptionFilter {
  private readonly sentryAdapter?: SentryAdapter

  private readonly airbrakeAdapter?: AirbrakeAdapter

  constructor(
    adapterHost: HttpAdapterHost,
    @NestOptional()
    @InjectLogger(AllExceptionsFilter)
    private readonly logger: Logger | undefined,
    @NestOptional() options: ExceptionFilterOptions | undefined,
  ) {
    super(adapterHost.httpAdapter)
    if (options && options.sentry) {
      this.sentryAdapter = new SentryAdapter(options.sentry)
    }
    if (options && options.airbrake) {
      this.airbrakeAdapter = new AirbrakeAdapter(options.airbrake)
    }
  }

  public catch(exception: unknown, host: ArgumentsHost) {
    const context = this.getContext(host)

    this.logger?.error(context, 'caught error', { exception })

    if (this.sentryAdapter) {
      this.sentryAdapter.captureException(context, exception)
    }
    if (this.airbrakeAdapter) {
      this.airbrakeAdapter.captureException(context, exception)
    }

    if (this.isGraphQLHost(host)) {
      return this.handleGraphQLHost(exception)
    }

    // handle http exception as normal
    if (exception instanceof HttpException) {
      return super.catch(exception, host)
    }

    // for other exception, handle without @cogitatio/errors package
    const jsonError = formatErrorToJSON(exception)
    const httpException = new HttpException(jsonError, jsonError.status)
    return super.catch(httpException, host)
  }

  private isGraphQLHost(host: ArgumentsHost): boolean {
    return host.getType() === 'http' && host.getArgs().length === 4
  }

  private handleGraphQLHost(exception: unknown) {
    if (exception instanceof HttpException) {
      const response = exception.getResponse()
      const message =
        (typeof response === 'string' ? response : (response as any).message) ||
        'unknown error'
      return new ApolloError(message, `HTTP_${exception.getStatus()}`)
    }
    const { message, code, ...rest } = formatErrorToJSON(exception)
    return new ApolloError(message, code, rest)
  }

  private getContext(host: ArgumentsHost): Context {
    switch (host.getType()) {
      case 'http': {
        if (host.getArgs().length === 4) {
          const gqlArgsHost = GqlArgumentsHost.create(host)
          return getContext(gqlArgsHost.getContext())
        } else {
          return getContext(host.switchToHttp().getRequest())
        }
      }
      default:
        return Context.background
    }
  }
}
