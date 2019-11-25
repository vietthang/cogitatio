export enum SchemaType {
  Any,
  Primitive,
  Enum,
  Optional,
  Nullable,
  List,
  Dictionary,
  Tuple,
  Object,
  Refinement,
  TaggedUnion,
}

export interface BaseSchema<T> {
  readonly type: SchemaType
  readonly _: T
}
