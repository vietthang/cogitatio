import { BaseSchema, SchemaType } from './common'
import { Resolve, SchemaLike } from './schema'

export type TaggedUnion<T extends {}> = {
  [key in keyof T]: { type: key } & { [k in key]: T[key] }
}[keyof T]

export interface TaggedUnionSchema<
  T extends { [key in keyof T]: SchemaLike } = any
> extends BaseSchema<TaggedUnion<{ [key in keyof T]: Resolve<T[key]> }>> {
  type: SchemaType.TaggedUnion
  schemaMap: T
}

export interface BaseTaggedUnionConstructor<
  T extends { [key in keyof T]: SchemaLike } = any
> {
  <K extends keyof T>(key: K, value: Resolve<T[K]>): TaggedUnion<
    { [key in keyof T]: Resolve<T[key]> }
  >
  readonly taggedUnionSchema: TaggedUnionSchema<T>
}

export type TaggedUnionConstructor<
  T extends { [key in keyof T]: SchemaLike } = any
> = BaseTaggedUnionConstructor<T> &
  {
    readonly [key in keyof T]: (
      v: Resolve<T[key]>,
    ) => TaggedUnion<{ [key in keyof T]: Resolve<T[key]> }>
  }

export function TaggedUnion<SM extends { [key in keyof SM]: SchemaLike }>(
  schemaMap: SM,
): TaggedUnionConstructor<SM> {
  const schema = {
    type: SchemaType.TaggedUnion,
    schemaMap,
  } as TaggedUnionSchema<SM>

  const ctor = <K extends keyof SM>(key: K, value: Resolve<SM[K]>) => {
    return {
      type: key,
      [key]: value,
    }
  }

  Object.defineProperty(ctor, 'taggedUnionSchema', {
    writable: false,
    value: schema,
  })

  for (const key of Object.keys(schemaMap)) {
    Object.defineProperty(ctor, key, {
      writable: false,
      value: (v: any) => ctor(key as any, v),
    })
  }

  return ctor as TaggedUnionConstructor<SM>
}

export function isTaggedUnionConstructor(
  fn: any,
): fn is TaggedUnionConstructor<any> {
  return fn.taggedUnionSchema !== undefined
}
