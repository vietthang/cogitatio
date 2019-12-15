import { DynamicModule, Module } from '@nestjs/common'
import { CoreModule, CoreModuleOptions } from './core.module'

@Module({})
export class ValidationModule {
  public static forRoot(options: CoreModuleOptions): DynamicModule {
    return CoreModule.forRoot(options)
  }
}
