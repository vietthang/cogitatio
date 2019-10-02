import Dataloader from 'dataloader'
import Knex from 'knex'
import { memoize } from './utils'

function createLoader<I extends { [key in keyof I]: Knex.Value } = {}>(
  qb: (
    q: Knex<any, any>,
    mapping: { [key in keyof I]: Knex.Raw<I[key]> },
  ) => Knex.QueryBuilder<any, any>,
  query: Knex<any, any>,
): Dataloader<I, unknown[]> {
  return new Dataloader(
    async inputs => {
      const mapping = {}
      const proxy = new Proxy(mapping, {
        get(target: any, key: string): unknown {
          if (target[key] === undefined) {
            target[key] = query.raw('??', `i.${key}`)
          }

          return target[key]
        },
      })

      const { sql, bindings } = qb(query, proxy).toSQL()

      const keys = Object.keys(mapping)
      const valuesFrag = query.raw(
        `(values ${inputs
          .flatMap(
            () =>
              `(${keys
                .map(() => '?')
                .concat('?')
                .join(', ')})`,
          )
          .join(', ')}) as ?? (${keys
          .map(() => '??')
          .concat('??')
          .join(', ')})`,
        [
          ...inputs.flatMap((input, index) =>
            keys.map(key => (input as any)[key]).concat(index),
          ),
          'i',
          ...keys,
          '__index__',
        ],
      )

      const results: any[] = await query
        .select('o.*', 'i.__index__')
        .from(valuesFrag)
        .join(
          query.raw(`lateral (${sql}) as ?? on ? `, [...bindings, 'o', true]),
        )

      return inputs.map((_, index) =>
        results
          .filter(result => result.__index__.toString() === index.toString())
          .map(({ __index__, ...rest }) => rest),
      )
    },
    {
      cache: false,
    },
  )
}

const createLoaderMemoized = memoize(
  createLoader,
  (qb, query) => query,
  (qb, query) => {
    const proxy = new Proxy(
      {},
      {
        get(_: any, key: string): any {
          return query.raw('??', `i.${key}`)
        },
      },
    )

    const { sql, bindings } = qb(query, proxy).toSQL()

    return [sql, ...bindings].join('\0')
  },
)

export function queryBatch<
  I extends { [key in keyof I]: Knex.Value } & object = {}
>(
  qb: (
    q: Knex<any, any>,
    mapping: { [key in keyof I]: Knex.Raw<I[key]> },
  ) => Knex.QueryBuilder<any, any>,
  query: Knex,
  input: I,
): Promise<unknown[]> {
  return createLoaderMemoized(qb, query).load(input)
}
