import { BaseSchema, SchemaType } from './common'

export interface AnySchema extends BaseSchema<unknown> {
  type: SchemaType.Any
}

export const Any: AnySchema = { type: SchemaType.Any } as AnySchema
