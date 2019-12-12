import { Refine, RefineConstructor, Resolve, SchemaLike } from '@cogitatio/core'

export function Default<S extends SchemaLike>(
  value: Resolve<S>,
  schema: S,
): RefineConstructor<Resolve<S>, unknown> {
  return Refine<unknown>()(schema, v => {
    if (v === undefined) {
      return value
    }
    return v
  })
}
