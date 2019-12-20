import { Refine } from '@cogitatio/core'

export type PhoneNumber = import('google-libphonenumber').PhoneNumber

export const PhoneNumber = Refine<PhoneNumber, typeof String>(
  String,
  value => value.getRawInputOrDefault(),
  input => {
    const libphonenumber: typeof import('google-libphonenumber') = require('google-libphonenumber')
    const pnUtil = libphonenumber.PhoneNumberUtil.getInstance()
    return pnUtil.parseAndKeepRawInput(input)
  },
)
