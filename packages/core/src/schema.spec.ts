import { SchemaType } from './common'
import { List } from './list'
import { ObjectSchema } from './object'
import { Property } from './property'
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
      @Property(String)
      public str!: string

      @Property(Number)
      public num!: number
    }
    const schema = resolveSchema(A)
    expect(schema.type).toEqual(SchemaType.Object)
    const fields = (schema as ObjectSchema<any>).fields
    expect(fields).toEqual([
      {
        key: 'str',
        externalKey: 'str',
        schema: String,
      },
      {
        key: 'num',
        externalKey: 'num',
        schema: Number,
      },
    ])
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
  })
})
