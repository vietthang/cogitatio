import { DynamicModule, Global, Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import {
  AllExceptionsFilter,
  ExceptionFilterOptions,
} from './all-exceptions-filter'

@Global()
@Module({})
export class ErrorsModule {
  public static forRoot(options: ExceptionFilterOptions): DynamicModule {
    return {
      module: ErrorsModule,
      providers: [
        {
          provide: ExceptionFilterOptions,
          useValue: options,
        },
        {
          provide: APP_FILTER,
          useClass: AllExceptionsFilter,
        },
      ],
    }
  }

  public static async forRootFromRc(
    keys: string[] = ['exception'],
  ): Promise<DynamicModule> {
    const { RcModule } = await import('@cogitatio/nestjs-rc')
    return {
      module: ErrorsModule,
      imports: [
        RcModule.forFeature(
          ExceptionFilterOptions,
          ExceptionFilterOptions,
          ...keys,
        ),
      ],
      providers: [
        {
          provide: APP_FILTER,
          useClass: AllExceptionsFilter,
        },
      ],
    }
  }
}
