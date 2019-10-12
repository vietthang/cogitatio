import { BaseSchema, SchemaType } from './common'
import { Resolve, resolveSchema, SchemaLike } from './schema'

export type Constructor<T extends {} = {}> = new (...args: any[]) => T

export interface ObjectSchema<T extends {} = {}> extends BaseSchema<T> {
  type: SchemaType.Object
  fields: () => { [key in keyof T]: BaseSchema<T[key]> }
}

export function Record<M extends { [key in keyof M]: SchemaLike }>(
  fields: M,
): ObjectSchema<{ [key in keyof M]: Resolve<M[key]> }> {
  return {
    type: SchemaType.Object,
    fields: () =>
      Object.fromEntries(
        Object.entries(fields).map(([key, schema]) => {
          return [key, resolveSchema(schema as any)]
        }),
      ),
  } as any
}
