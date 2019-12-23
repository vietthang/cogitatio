export interface JsonError {
  code: string
  status: number
  message: string
  stack?: string
  origin?: JsonError
  extra?: unknown
}

export function wrapError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError({
      code: 'INTERNAL_ERROR',
      status: 500,
      message: error.message,
      origin: error,
    })
  }

  return new AppError({
    code: 'INTERNAL_ERROR',
    status: 500,
    message: 'unknown error',
    extra: error,
  })
}

export function formatErrorToJSON(error: unknown): JsonError {
  if (error instanceof AppError) {
    return {
      code: error.code,
      status: error.status,
      message: error.message,
      stack: error.stack,
      origin: error.origin ? formatErrorToJSON(error.origin) : undefined,
      extra: error.extra,
    }
  }

  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      status: 500,
      message: error.message,
      stack: error.stack,
    }
  }

  return {
    code: 'INTERNAL_ERROR',
    status: 500,
    message: 'unknown error',
    extra: error,
  }
}

export interface AppErrorInit {
  code?: string
  status?: number
  message?: string
  origin?: unknown
  extra?: unknown
}

export class AppError extends Error {
  public readonly code: string

  public readonly status: number

  public readonly origin?: unknown

  public readonly extra?: unknown

  constructor({
    code = 'UNKNOWN_ERROR',
    status = 500,
    message = code,
    origin,
    extra,
  }: AppErrorInit = {}) {
    super(message)

    this.code = code
    this.status = status
    this.origin = origin
    this.extra = extra
  }

  public toJSON() {
    return formatErrorToJSON(this)
  }

  public extend(options: AppErrorInit): AppError {
    return new AppError({
      ...this,
      ...options,
    })
  }
}
