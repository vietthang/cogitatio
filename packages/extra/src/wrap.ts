import { Resolve, SchemaLike } from '@cogitatio/core'
import { IDecoder, IEncoder } from './codec'

export interface IWrapFuncOptions<
  InSchemas extends SchemaLike[],
  OutSchema extends SchemaLike
> {
  inSchemas: InSchemas
  outSchema: OutSchema
  decoder: IDecoder<unknown>
  encoder: IEncoder<unknown>
}

export function wrapFunc<
  InSchemas extends SchemaLike[],
  OutSchema extends SchemaLike,
  Fn extends (
    ...args: { [key in keyof InSchemas]: Resolve<InSchemas[key]> }
  ) => Resolve<OutSchema>
>(
  fn: Fn,
  {
    inSchemas,
    outSchema,
    decoder,
    encoder,
  }: IWrapFuncOptions<InSchemas, OutSchema>,
): Fn {
  return ((...args: unknown[]) => {
    const result = fn(
      ...(args.map((arg, i) => encoder.encode(inSchemas[i], arg)) as any),
    )
    if (typeof result.then === 'function') {
      return result.then((out: any) => decoder.decode(outSchema, out))
    }
    return decoder.decode(outSchema, result)
  }) as any
}
