import { AppError, AppErrorOptions } from './error'

export function error(options: AppErrorOptions): AppError {
  return new AppError(options)
}

export type QuickAppErrorOptions = Omit<AppErrorOptions, 'status'>

export function badRequest(options: QuickAppErrorOptions = {}): AppError {
  return error({
    code: 'GENERIC_BAD_REQUEST',
    message: 'Bad Request',
    ...options,
    status: 400,
  })
}

export function unauthorized(options: QuickAppErrorOptions = {}): AppError {
  return error({
    code: 'GENERIC_UNAUTHORIZED',
    message: 'Unauthorized',
    ...options,
    status: 401,
  })
}

export function paymentRequired(options: QuickAppErrorOptions = {}): AppError {
  return error({
    code: 'GENERIC_PAYMENT_REQUIRED',
    message: 'Payment Required',
    ...options,
    status: 402,
  })
}

export function forbidden(options: QuickAppErrorOptions = {}): AppError {
  return error({
    code: 'GENERIC_FORBIDDEN',
    message: 'Forbidden',
    ...options,
    status: 403,
  })
}

export function notFound(options: QuickAppErrorOptions = {}): AppError {
  return error({
    code: 'GENERIC_NOT_FOUND',
    message: 'Not Found',
    ...options,
    status: 404,
  })
}

export function methodNotAllowed(options: QuickAppErrorOptions = {}): AppError {
  return error({
    code: 'GENERIC_METHOD_NOT_ALLOWED',
    message: 'Method Not Allowed',
    ...options,
    status: 405,
  })
}

export function notAcceptable(options: QuickAppErrorOptions = {}): AppError {
  return error({
    code: 'GENERIC_NOT_ACCEPTABLE',
    message: 'Not Acceptable',
    ...options,
    status: 406,
  })
}

export function clientTimeout(options: QuickAppErrorOptions = {}): AppError {
  return error({
    code: 'GENERIC_CLIENT_TIMEOUT',
    message: 'Client Timeout',
    ...options,
    status: 408,
  })
}

export function conflict(options: QuickAppErrorOptions = {}): AppError {
  return error({
    code: 'GENERIC_CONFLICT',
    message: 'Conflict',
    ...options,
    status: 409,
  })
}

export function gone(options: QuickAppErrorOptions = {}): AppError {
  return error({
    code: 'GENERIC_GONE',
    message: 'Gone',
    ...options,
    status: 410,
  })
}

export function internal(options: QuickAppErrorOptions = {}): AppError {
  return error({
    code: 'GENERIC_INTERNAL',
    message: 'Internal Server Error',
    ...options,
    status: 500,
  })
}

export function notImplemented(options: QuickAppErrorOptions = {}): AppError {
  return error({
    code: 'GENERIC_NOT_IMPLEMENTED',
    message: 'Not Implemented',
    ...options,
    status: 501,
  })
}

export function badGateway(options: QuickAppErrorOptions = {}): AppError {
  return error({
    code: 'GENERIC_BAD_GATEWAY',
    message: 'Bad Gateway',
    ...options,
    status: 502,
  })
}

export function serviceUnavailable(
  options: QuickAppErrorOptions = {},
): AppError {
  return error({
    code: 'GENERIC_SERVICE_UNAVAILABLE',
    message: 'Service Unavailable',
    ...options,
    status: 503,
  })
}

export function gatewayTimeut(options: QuickAppErrorOptions = {}): AppError {
  return error({
    code: 'GENERIC_GATEWAY_TIMEOUT',
    message: 'Gateway Timeout',
    ...options,
    status: 504,
  })
}

export type ErrorTransformer = (origin: Error) => AppErrorOptions

const defaultErrorTransformer: ErrorTransformer = origin => ({ origin })

export async function wrapAsync<T>(
  promise: Promise<T>,
  errorTransform: ErrorTransformer = defaultErrorTransformer,
): Promise<T> {
  const base = internal()
  try {
    return await promise
  } catch (origin) {
    const error = base.extend(errorTransform(origin))
    error.stack = base.stack
    throw error
  }
}
