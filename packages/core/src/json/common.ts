export type JsonPrimitive = boolean | number | string | null | undefined

export type JsonArray = JsonValue[]

export interface JsonObject {
  [key: string]: JsonValue
}

export type JsonValue = JsonPrimitive | JsonArray | JsonObject
