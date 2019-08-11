export enum SchemaType {
  Primitive,
  Enum,
  Optional,
  Nullable,
  List,
  Dictionary,
  Tuple,
  Object,
  Brand,
}

export interface IBaseSchema<T> {
  readonly type: SchemaType
  readonly _: T
}
