import {
  Optional,
  Refine,
  RefineConstructor,
  Resolve,
  SchemaLike,
  success,
} from '@cogitatio/core'

export function Default<S extends SchemaLike>(
  defaultValue: Resolve<S>,
  schema: S,
): RefineConstructor<Resolve<S>, Resolve<S> | undefined> {
  return Refine<Resolve<S>, any>(
    Optional(schema),
    (_, v) => v,
    (_, v) => {
      if (v === undefined) {
        return success(defaultValue)
      }
      return success(v)
    },
  )
}
