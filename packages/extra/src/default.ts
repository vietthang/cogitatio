import {
  Optional,
  Refine,
  RefineConstructor,
  Resolve,
  SchemaLike,
} from '@cogitatio/core'

export function Default<S extends SchemaLike>(
  defaultValue: Resolve<S>,
  schema: S,
): RefineConstructor<Resolve<S>, Resolve<S> | undefined> {
  return Refine<Resolve<S>, any>(
    Optional(schema),
    v => v,
    v => {
      if (v === undefined) {
        return defaultValue
      }
      return v
    },
  )
}
