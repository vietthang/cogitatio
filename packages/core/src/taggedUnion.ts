import { IBaseSchema, SchemaType } from './common'
import { Resolve, SchemaLike } from './schema'

export type TaggedUnion<Discriminator extends string, T extends {}> = {
  [key in keyof T]: { [d in Discriminator]: key } & { [k in key]: T[key] }
}[keyof T]

export interface ITaggedUnionSchema<
  Discriminator extends string = string,
  T extends { [key in keyof T]: SchemaLike } = any
>
  extends IBaseSchema<
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
): ITaggedUnionSchema<Discriminator, SM> {
  return {
    type: SchemaType.TaggedUnion,
    discriminator,
    schemaMap,
  } as ITaggedUnionSchema<Discriminator, SM>
}
