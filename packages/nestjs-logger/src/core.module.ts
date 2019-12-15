import { DynamicModule, Global } from '@nestjs/common'
import { LoggerOptions } from 'winston'
import { LOGGER_CONFIG_SYMBOL } from './common'
import { registeredProviders } from './injectLogger.decorator'

export type CoreModuleOptions = LoggerOptions

@Global()
export class LoggerCoreModule {
  public static forRoot(options: CoreModuleOptions): DynamicModule {
    return {
      module: LoggerCoreModule,
      providers: [
        {
          provide: LOGGER_CONFIG_SYMBOL,
          useValue: options,
        },
        ...registeredProviders,
      ],
      exports: [
        LOGGER_CONFIG_SYMBOL,
        ...registeredProviders.map(provider => provider.provide),
      ],
    }
  }
}
