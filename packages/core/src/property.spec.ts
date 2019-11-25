import { SchemaType } from './common'
import { Property } from './property'

describe('test @Property', () => {
  it('should resolve primitive constructor correctly', () => {
    expect(Property(String).schema()).toStrictEqual({
      type: SchemaType.Primitive,
      native: String,
    })
  })
})
