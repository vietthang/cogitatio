import { Schema as JoiSchema } from '@hapi/joi'

const reflectMap = new WeakMap<any, any>()

export type JoiSchemaTransformer = <T extends JoiSchema>(schema: T) => T

export function reflectClass(
  ctor: any,
): { [key: string]: JoiSchemaTransformer[] } | undefined {
  return reflectMap.get(ctor)
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
