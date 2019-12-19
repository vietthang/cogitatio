import { RuntimeType } from './types'

export const GenerateClassRtti: ClassDecorator = () => {
  throw new Error('static access only')
}

export type Constructor = new (...args: any[]) => any

const metadataMap = new WeakMap<any, RuntimeType>()

// @internal
export function ClassRtti(schema: RuntimeType): ClassDecorator {
  return target => {
    metadataMap.set(target, schema)
  }
}

export function getClassRtti(target: Constructor): RuntimeType | undefined {
  return metadataMap.get(target)
}
