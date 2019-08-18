import { IBaseSchema, SchemaType } from './common'

export interface IAnySchema extends IBaseSchema<unknown> {
  type: SchemaType.Any
}

export const Any: IAnySchema = { type: SchemaType.Any } as IAnySchema
