import { Resolve, SchemaLike } from '@cogitatio/core'
import { Abstract, DynamicModule, Module, Type } from '@nestjs/common'
import { registerProvider } from './common'
import { CoreModule, CoreModuleOptions } from './core.module'
import { generateNamedClass } from './utils'

@Module({})
export class RcModule {
  public static forRoot<S extends SchemaLike>(
    options: CoreModuleOptions<S>,
  ): DynamicModule {
    return CoreModule.forRoot(options)
  }

  public static forFeature<S extends SchemaLike>(
    provide: string | symbol | Type<Resolve<S>> | Abstract<Resolve<S>>,
    schema: S,
    ...keys: string[]
  ): DynamicModule {
    const provider = registerProvider(provide, schema, ...keys)

    return {
      module: generateNamedClass(class {}, '__RCFeature'),
      providers: [
        {
          ...provider,
          provide,
        },
      ],
    }
  }
}
