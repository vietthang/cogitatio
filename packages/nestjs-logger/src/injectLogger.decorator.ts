import { Inject } from '@nestjs/common'
import { FactoryProvider } from '@nestjs/common/interfaces'
import { LoggerOptions } from 'winston'
import { LOGGER_CONFIG_SYMBOL } from './common'
import { Logger, WinstonLogger } from './logger'

const prefix = '___LOGGER'

export const registeredProviders: FactoryProvider[] = []

export function InjectLogger(
  nameOrClass?: string | (new (...args: any[]) => any),
  options?: LoggerOptions,
) {
  const name =
    (nameOrClass && typeof nameOrClass === 'function'
      ? nameOrClass.name
      : nameOrClass) || 'Untitled'
  const key = [prefix, name].join('__')
  registeredProviders.push({
    provide: key,
    useFactory(defaultOptions?: LoggerOptions): Logger {
      return new WinstonLogger(name, { ...defaultOptions, ...options })
    },
    inject: [LOGGER_CONFIG_SYMBOL],
  })
  return Inject(key)
}
