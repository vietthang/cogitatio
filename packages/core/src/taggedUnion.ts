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

export function TaggedUnion<SM extends { [key in keyof SM]: SchemaLike }>(
  schemaMap: SM,
): TaggedUnionSchema<SM> {
  return {
    type: SchemaType.TaggedUnion,
    schemaMap,
  } as TaggedUnionSchema<SM>
}
