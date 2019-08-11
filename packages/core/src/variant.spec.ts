import 'jest'

import { Refine } from './brand'
import { SchemaType } from './common'
import { Variant } from './property'

describe('test @Variant', () => {
  it('should resolve primitive constructor correctly', () => {
    expect(Variant(String).schema()).toStrictEqual({
      type: SchemaType.Primitive,
      native: String,
    })
  })

  it('should handle transformers correctly', () => {
    expect(Variant(String, s => s).schema()).toStrictEqual({
      type: SchemaType.Primitive,
      native: String,
    })

    expect(
      Variant(String, s => Refine(s, { foo: true } as const)).schema(),
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
