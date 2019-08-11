import 'jest'

import { Refine } from './brand'
import { SchemaType } from './common'
import { Property } from './property'

describe('test @Property', () => {
  it('should resolve primitive constructor correctly', () => {
    expect(Property(String).schema()).toStrictEqual({
      type: SchemaType.Primitive,
      native: String,
    })
  })

  it('should handle transformers correctly', () => {
    expect(Property(String, s => s).schema()).toStrictEqual({
      type: SchemaType.Primitive,
      native: String,
    })

    expect(
      Property(String, s => Refine(s, { foo: true } as const)).schema(),
    ).toStrictEqual({
      type: SchemaType.Brand,
      brand: {
        foo: true,
      },
      childSchema: {
        type: SchemaType.Primitive,
        native: String,
      },
    })
  })
})
