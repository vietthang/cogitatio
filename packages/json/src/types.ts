export type JsonPrimitive = boolean | number | string | null | undefined

export type JsonValue =
  | JsonPrimitive
  | { [key: string]: JsonValue }
  | JsonValue[]
