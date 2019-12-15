import { DynamicModule, Module } from '@nestjs/common'
import { CoreModuleOptions, LoggerCoreModule } from './core.module'

@Module({})
export class LoggerModule {
  public static forRoot(options: CoreModuleOptions): DynamicModule {
    return LoggerCoreModule.forRoot(options)
  }
}
