export enum Kind {
  Unsupported = 'Unsupported',
  Unknown = 'Unknown',
  Any = 'Any',
  Void = 'Void',
  Never = 'Never',
  Null = 'Null',
  Undefined = 'Undefined',
  Literal = 'Literal',
  Boolean = 'Boolean',
  Number = 'Number',
  String = 'String',
  BigInt = 'BigInt',
  Object = 'Object',
  Array = 'Array',
  Tuple = 'Tuple',
  Union = 'Union',
  Intersection = 'Intersection',
  Enum = 'Enum',
  Wellknown = 'Wellknown',
}

export interface BaseType {
  kind: Kind
  fqn?: string
}

export interface UnsupportedType extends BaseType {
  kind: Kind.Unsupported
}

export interface UnknownType extends BaseType {
  kind: Kind.Unknown
}

export interface AnyType extends BaseType {
  kind: Kind.Any
}

export interface VoidType extends BaseType {
  kind: Kind.Void
}

export interface NeverType extends BaseType {
  kind: Kind.Never
}

export interface NullType extends BaseType {
  kind: Kind.Null
}

export interface UndefinedType extends BaseType {
  kind: Kind.Undefined
}

export interface LiteralType extends BaseType {
  kind: Kind.Literal
  value: any
}

export interface BooleanType extends BaseType {
  kind: Kind.Boolean
}

export interface NumberType extends BaseType {
  kind: Kind.Number
}

export interface StringType extends BaseType {
  kind: Kind.String
}

export interface BigIntType extends BaseType {
  kind: Kind.BigInt
}

export enum ObjectPropertyScope {
  Public = 'public',
  Protected = 'protected',
  Private = 'private',
}

export interface ObjectProperty {
  name: string
  readonly: boolean
  optional: boolean
  scope: ObjectPropertyScope
  type: RuntimeType
}

export interface Param {
  name: string
  type: RuntimeType
}

export interface Signature {
  params: Param[]
  returnType: RuntimeType
  typeParameters?: RuntimeType[]
}

export interface ObjectType extends BaseType {
  kind: Kind.Object
  callSignatures: Signature[]
  constructSignatures: Signature[]
  properties: ObjectProperty[]
  numberIndexType?: RuntimeType
  stringIndexType?: RuntimeType
  typeParameters?: RuntimeType[]
  typeArguments?: RuntimeType[]
}

export interface ArrayType extends BaseType {
  kind: Kind.Array
  elementType: BaseType
}

export interface TupleType extends BaseType {
  kind: Kind.Tuple
  elementTypes: BaseType[]
}

export interface UnionType extends BaseType {
  kind: Kind.Union
  elementTypes: BaseType[]
}

export interface IntersectionType extends BaseType {
  kind: Kind.Intersection
  elementTypes: BaseType[]
}

export interface EnumValue {
  name: string
  value: any
}

export interface EnumType extends BaseType {
  kind: Kind.Enum
  values: EnumValue[]
}

export interface WellknownType extends BaseType {
  kind: Kind.Wellknown
  fqn: string
  typeParameters?: RuntimeType[]
  typeArguments?: RuntimeType[]
}

export type RuntimeType =
  | UnsupportedType
  | UnknownType
  | AnyType
  | VoidType
  | NeverType
  | NullType
  | UndefinedType
  | LiteralType
  | BooleanType
  | NumberType
  | StringType
  | BigIntType
  | ObjectType
  | ArrayType
  | TupleType
  | UnionType
  | IntersectionType
  | EnumType
  | WellknownType
