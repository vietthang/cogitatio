import {
  Constructor,
  DictionarySchema,
  EnumSchema,
  ListSchema,
  NullableSchema,
  ObjectSchema,
  OptionalSchema,
  PrimitiveConstructor,
  PrimitiveSchema,
  Refine,
  RefineSchema,
  Resolve,
  SchemaLike,
  TaggedUnionSchema,
  TupleSchema,
} from '@cogitatio/core'

export const PhoneNumber = Refine<{ phoneNumber: true }>()(String, input => {
  const libphonenumber: typeof import('google-libphonenumber') = require('google-libphonenumber')
  const pnUtil = libphonenumber.PhoneNumberUtil.getInstance()
  const phoneNumber = pnUtil.parseAndKeepRawInput(input)
  return phoneNumber.getRawInput()!
})

export type PhoneNumber = Resolve<typeof PhoneNumber>
