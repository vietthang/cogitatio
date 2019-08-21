const joi = require('@hapi/joi')

const j = joi.extend({
  name: 'bigint',
  language: {
    base: '!!"{{value}}" is not a bigint',
  },
  coerce(value, state, prefs) {
    if (typeof value === 'bigint') {
      return value
    }

    if (!prefs.convert) {
      return this.createError('bigint.base', { value }, state, prefs)
    }

    try {
      return { value: BigInt(value) }
    } catch (err) {
      return this.createError('bigint.base', { value }, state, prefs)
    }
  },
})

console.log(j.bigint().validate('0', { convert: true }))
