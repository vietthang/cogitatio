import 'jest'

import { Refine } from './brand'
import { SchemaType } from './common'
import { List } from './list'
import { IObjectSchema, Record } from './object'
import { Variant } from './property'
import { resolveSchema } from './schema'
import { Tuple } from './tuple'

describe('test resolveSchema', () => {
  it('should handle primitive constructor fine', () => {
    expect(resolveSchema(Boolean)).toStrictEqual({
      type: SchemaType.Primitive,
      native: Boolean,
    })
    expect(resolveSchema(Number)).toStrictEqual({
      type: SchemaType.Primitive,
      native: Number,
    })
    expect(resolveSchema(String)).toStrictEqual({
      type: SchemaType.Primitive,
      native: String,
    })
    expect(resolveSchema(BigInt)).toStrictEqual({
      type: SchemaType.Primitive,
      native: BigInt,
    })
    expect(resolveSchema(Date)).toStrictEqual({
      type: SchemaType.Primitive,
      native: Date,
    })
    expect(resolveSchema(Buffer)).toStrictEqual({
      type: SchemaType.Primitive,
      native: Buffer,
    })
    expect(resolveSchema(ArrayBuffer)).toStrictEqual({
      type: SchemaType.Primitive,
      native: ArrayBuffer,
    })
  })

  it('should handle array fine', () => {
    expect(resolveSchema(List(String))).toStrictEqual({
      type: SchemaType.List,
      childSchema: {
        type: SchemaType.Primitive,
        native: String,
      },
    })
    expect(resolveSchema(List(List(String)))).toStrictEqual({
      type: SchemaType.List,
      childSchema: {
        type: SchemaType.List,
        childSchema: {
          type: SchemaType.Primitive,
          native: String,
        },
      },
    })
  })

  it('should handle decorated class fine', () => {
    class A {
      @Variant(String)
      public str!: string

      @Variant(Number)
      public num!: number
    }
    const schema = resolveSchema(A)
    expect(schema.type).toEqual(SchemaType.Object)
    expect((schema as IObjectSchema).fields()).toStrictEqual({
      str: {
        type: SchemaType.Primitive,
        native: String,
      },
      num: {
        type: SchemaType.Primitive,
        native: Number,
      },
    })
  })

  it('should handle raw object dictionary fine', () => {
    const schema = resolveSchema(Record({ num: Number, str: String }))
    expect(schema.type).toStrictEqual(SchemaType.Object)
    expect((schema as IObjectSchema).fields()).toStrictEqual({
      str: {
        type: SchemaType.Primitive,
        native: String,
      },
      num: {
        type: SchemaType.Primitive,
        native: Number,
      },
    })
  })

  it('should handle schema fine', () => {
    expect(List(String)).toEqual({
      type: SchemaType.List,
      childSchema: {
        type: SchemaType.Primitive,
        native: String,
      },
    })
    expect(Tuple(String, Number)).toEqual({
      type: SchemaType.Tuple,
      childSchemas: [
        {
          type: SchemaType.Primitive,
          native: String,
        },
        {
          type: SchemaType.Primitive,
          native: Number,
        },
      ],
    })
    expect(Refine(String, { email: true } as const)).toEqual({
      type: SchemaType.Brand,
      brand: { email: true },
      childSchema: {
        type: SchemaType.Primitive,
        native: String,
      },
    })
  })
})
