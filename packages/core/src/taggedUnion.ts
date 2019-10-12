import { BaseSchema, SchemaType } from './common'
import { Resolve, SchemaLike } from './schema'

export type TaggedUnion<Discriminator extends string, T extends {}> = {
  [key in keyof T]: { [d in Discriminator]: key } & { [k in key]: T[key] }
}[keyof T]

export interface TaggedUnionSchema<
  Discriminator extends string = string,
  T extends { [key in keyof T]: SchemaLike } = any
>
  extends BaseSchema<
    TaggedUnion<Discriminator, { [key in keyof T]: Resolve<T[key]> }>
  > {
  type: SchemaType.TaggedUnion
  discriminator: Discriminator
  schemaMap: T
}

export function TaggedUnion<
  Discriminator extends string,
  SM extends { [key in keyof SM]: SchemaLike }
>(
  discriminator: Discriminator,
  schemaMap: SM,
): TaggedUnionSchema<Discriminator, SM> {
  return {
    type: SchemaType.TaggedUnion,
    discriminator,
    schemaMap,
  } as TaggedUnionSchema<Discriminator, SM>
}
