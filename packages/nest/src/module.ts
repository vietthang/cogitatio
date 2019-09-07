import { IDecoder } from '@cogitatio/extra'
import { DynamicModule, Global } from '@nestjs/common'
import {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  ValueProvider,
} from '@nestjs/common/interfaces'
import { decoderSymbol, pipeClasses } from './pipe'

export type Provider<T> =
  | Omit<ClassProvider<T>, 'provide'>
  | Omit<ValueProvider<T>, 'provide'>
  | Omit<FactoryProvider<T | Promise<T>>, 'provide'>
  | Omit<ExistingProvider<T>, 'provide'>

export interface CogitatioModuleOptions {
  decoder: Provider<IDecoder<unknown>>
}

@Global()
export class CogitatioModule {
  public static forRoot({ decoder }: CogitatioModuleOptions): DynamicModule {
    return {
      module: CogitatioModule,
      providers: [
        {
          ...decoder,
          provide: decoderSymbol,
        },
        ...[...pipeClasses.entries()].map(([key, value]) => {
          return {
            provide: key,
            useClass: value,
          }
        }),
      ],
    }
  }
}
