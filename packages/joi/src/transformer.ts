import joi from 'joi'

export type ResolveJoiSchemaType<T> = T extends boolean
  ? joi.BooleanSchema
  : T extends number
  ? joi.NumberSchema
  : T extends string
  ? joi.StringSchema
  : T extends Date
  ? joi.DateSchema
  : T extends Buffer
  ? joi.BinarySchema
  : T extends unknown[]
  ? joi.ArraySchema
  : T extends object
  ? joi.ObjectSchema
  : joi.AnySchema

export type SafePropertyDecorator<Value extends unknown> = <
  T extends { [key in Key]?: Value },
  Key extends (keyof T) & (string | symbol)
>(
  target: T,
  key: Key,
) => void

export type JoiSchemaTransformer<T extends unknown = unknown> = (
  schema: ResolveJoiSchemaType<T>,
) => ResolveJoiSchemaType<T>

export function PropertyConfig<T extends unknown = unknown>(
  transformer: JoiSchemaTransformer<T>,
): SafePropertyDecorator<T> {
  return (target, key) => {
    if (typeof key !== 'string') {
      throw new Error('non string property is not supported')
    }
    decorateClass(target.constructor, key, transformer)
  }
}

const reflectMap = new WeakMap<any, any>()

export function reflectClass(
  ctor: any,
): { [key: string]: JoiSchemaTransformer[] } | undefined {
  return reflectMap.get(ctor)
}

export function getPropertyTransformers(
  ctor: any,
  key: any,
): JoiSchemaTransformer[] {
  const descriptor: any = reflectClass(ctor)
  if (!descriptor) {
    return []
  }
  return descriptor[key] || []
}

export function decorateClass(
  ctor: any,
  key: any,
  transformer: JoiSchemaTransformer,
) {
  const descriptor: any = reflectClass(ctor) || {}
  reflectMap.set(ctor, {
    ...descriptor,
    [key]: (descriptor[key] || []).concat(transformer),
  })
}
