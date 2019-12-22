import { Refine, success } from '@cogitatio/core'

export type PhoneNumber = import('google-libphonenumber').PhoneNumber

export const PhoneNumber = Refine<PhoneNumber, typeof String>(
  String,
  (_, value) => value.getRawInputOrDefault(),
  (context, value) => {
    const libphonenumber: typeof import('google-libphonenumber') = require('google-libphonenumber')
    const pnUtil = libphonenumber.PhoneNumberUtil.getInstance()
    try {
      return success(pnUtil.parseAndKeepRawInput(value))
    } catch {
      return context.failure({
        message: 'invalid value for PhoneNumber',
        value,
        rule: 'PhoneNumber',
      })
    }
  },
)
