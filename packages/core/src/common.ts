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
  Brand,
  TaggedUnion,
}

export interface IBaseSchema<T> {
  readonly type: SchemaType
  readonly _: T
}
