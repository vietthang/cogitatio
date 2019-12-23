import { error, formatErrorToJSON } from '@cogitatio/errors'
import {
  ClientIdContextKey,
  Context,
  RequestIdContextKey,
  RequestTimeContextKey,
  TypedKey,
} from '@cogitatio/nestjs-common'
import winston from 'winston'

export interface LogMeta {
  exception?: unknown
  labels?: string[]
  [key: string]: unknown
}

export interface Logger {
  error(context: Context, message: string, meta?: LogMeta): void
  warn(context: Context, message: string, meta?: LogMeta): void
  info(context: Context, message: string, meta?: LogMeta): void
  verbose(context: Context, message: string, meta?: LogMeta): void
  debug(context: Context, message: string, meta?: LogMeta): void
  silly(context: Context, message: string, meta?: LogMeta): void
}

interface LoggersConfig {
  levels: { [key: string]: string | undefined }
}

export const LoggersContextKey = 'loggers' as TypedKey<LoggersConfig>

export class WinstonLogger implements Logger {
  private readonly defaultLogger: winston.Logger

  private readonly contextLoggers = new WeakMap<Context, winston.Logger>()

  constructor(
    private readonly name: string,
    private readonly options: winston.LoggerOptions = {},
  ) {
    this.defaultLogger = winston.createLogger(options)
  }

  public error(context: Context, message: string, meta?: LogMeta): void {
    const logger = this.getLoggerForContext(context)
    logger.error(message, this.transformMeta(context, meta))
  }
  public warn(context: Context, message: string, meta?: LogMeta): void {
    const logger = this.getLoggerForContext(context)
    logger.warn(message, this.transformMeta(context, meta))
  }
  public info(context: Context, message: string, meta?: LogMeta): void {
    const logger = this.getLoggerForContext(context)
    logger.info(message, this.transformMeta(context, meta))
  }
  public verbose(context: Context, message: string, meta?: LogMeta): void {
    const logger = this.getLoggerForContext(context)
    logger.verbose(message, this.transformMeta(context, meta))
  }
  public debug(context: Context, message: string, meta?: LogMeta): void {
    const logger = this.getLoggerForContext(context)
    logger.debug(message, this.transformMeta(context, meta))
  }
  public silly(context: Context, message: string, meta?: LogMeta): void {
    const logger = this.getLoggerForContext(context)
    logger.silly(message, this.transformMeta(context, meta))
  }

  private getLoggerForContext(context: Context): winston.Logger {
    const cachedLogger = this.contextLoggers.get(context)
    if (cachedLogger) {
      return cachedLogger
    }
    const config = context.value(LoggersContextKey)
    if (!config) {
      return this.defaultLogger
    }
    const level = config.levels[this.name]
    if (!level) {
      return this.defaultLogger
    }
    const logger = winston.createLogger({
      ...this.options,
      level,
    })
    this.contextLoggers.set(context, logger)
    return logger
  }

  private transformMeta(context: Context, meta?: LogMeta): unknown {
    const clientId = context.value(ClientIdContextKey)
    const requestId = context.value(RequestIdContextKey)
    const requestTime = context.value(RequestTimeContextKey)

    if (!meta) {
      return {
        module: this.name,
        clientId,
        requestId,
        requestTime,
      }
    }

    const { exception, labels, ...other } = meta

    return {
      module: this.name,
      clientId,
      requestId,
      requestTime,
      meta: other,
      labels,
      exception: exception ? formatErrorToJSON(exception) : undefined,
    }
  }
}
