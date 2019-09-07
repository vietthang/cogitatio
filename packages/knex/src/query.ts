import { createLoader } from './loader'
import { memoize, objectSerializer } from './utils'

const createLoaderCached = memoize(
  createLoader,
  q => q,
  (_q, transform, matcher) =>
    [objectSerializer(transform), objectSerializer(matcher)].join('\0'),
)

export function query() {}
