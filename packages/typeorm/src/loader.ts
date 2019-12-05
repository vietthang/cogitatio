import DataLoader from 'dataloader'
import {
  Connection,
  ObjectLiteral,
  ObjectType,
  QueryRunner,
  SelectQueryBuilder,
} from 'typeorm'
import { DriverUtils } from 'typeorm/driver/DriverUtils'
import { groupBy, objectId } from './utils'

function getQueryRunner(qb: SelectQueryBuilder<any>): QueryRunner | undefined {
  return (qb as any).queryRunner
}

function merge<T>(
  connection: Connection,
  entityTarget: ObjectType<T>,
  alias: string,
  raw: any,
): T {
  const metadata = connection.getMetadata(entityTarget)
  const entity = metadata.create()
  for (const column of metadata.columns) {
    const columnAlias = DriverUtils.buildColumnAlias(
      connection.driver,
      alias,
      column.databaseName,
    )
    const value = raw[columnAlias]
    if (value === undefined) {
      throw new Error(`missing value for "${columnAlias}"`)
    }
    column.setEntityValue(entity, value)
  }
  return entity
}

interface Result<T> {
  entity: T
  raw: any
  index: number
}

async function doLoadGrouped<T>(
  queryRunner: QueryRunner,
  sql: string,
  entityClass: ObjectType<T>,
  aliasName: string,
  entries: Array<{
    params: ObjectLiteral
    index: number
  }>,
): Promise<Array<Result<T>>> {
  let currentId = 1
  const ioId = () => `k${(currentId++).toString()}`

  const escape = (name: string): string =>
    queryRunner.connection.driver.escape(name)

  const joinFrag = sql
  const paramKeys = Object.keys(entries[0].params)
  const joinBindings: ObjectLiteral = Object.fromEntries(
    paramKeys.map(key => [key, () => `${escape('i')}.${escape(key)}`]),
  )

  const selectFrag = `o.*, i.__index__`
  const selectBindings: ObjectLiteral = {}
  const [fromFrags, fromBindings] = entries.reduce<[string[], ObjectLiteral]>(
    ([frags, params], entry, i) => {
      const keys = Object.keys(entry.params)
      const generatedKeys = keys.map(ioId)
      const newSql = `(SELECT ${keys
        .map((key, j) => `:${generatedKeys[j]}::text AS ${escape(key)}`)
        .concat(`:i${i}::text AS ${escape('__index__')}`)
        .join(', ')})`
      return [
        frags.concat(newSql),
        {
          ...params,
          [`i${i}`]: entry.index,
          ...Object.fromEntries(
            generatedKeys.map((key, index) => [key, entry.params[keys[index]]]),
          ),
        },
      ]
    },
    [[], {}],
  )
  const fromFrag = fromFrags.join(' UNION ALL ')

  const finalSql = `SELECT ${selectFrag} FROM (${fromFrag}) AS ${escape(
    'i',
  )} INNER JOIN LATERAL (${joinFrag}) AS ${escape('o')} ON true`
  const finalBindings = { ...selectBindings, ...fromBindings, ...joinBindings }

  const results: any[] = await queryRunner.query(
    ...queryRunner.connection.driver.escapeQueryWithParameters(
      finalSql,
      finalBindings,
      {},
    ),
  )

  return results.map(({ __index__, ...raw }) => {
    const entity = merge<T>(queryRunner.connection, entityClass, aliasName, raw)
    const index = Number(__index__)
    return { entity, index, raw }
  })
}

async function doLoad<Ins extends any[], O>(
  querier: (...inputs: Ins) => SelectQueryBuilder<O>,
  inputs: ReadonlyArray<Ins>,
): Promise<Array<Array<Result<O>> | Error>> {
  const entries = inputs
    .map(args => querier(...args))
    .map((qb, index) => {
      const queryRunner = getQueryRunner(qb)
      const connection = qb.connection
      const sql = qb.getQuery()
      const params = qb.getParameters()
      const mainAlias = qb.expressionMap.mainAlias
      if (!mainAlias) {
        throw new Error('TODO misssing main alias')
      }
      if (typeof mainAlias.target !== 'function') {
        throw new Error('TODO target is not class')
      }

      return {
        connection,
        sql,
        params,
        queryRunner,
        index,
        entityClass: mainAlias.target as ObjectType<O>,
        aliasName: mainAlias.name,
      }
    })

  const grouped = groupBy(
    entries,
    ({ connection, sql, queryRunner, entityClass, aliasName }) => {
      return [
        objectId(connection),
        queryRunner && objectId(queryRunner),
        sql,
        objectId(entityClass),
        aliasName,
      ].join('\0')
    },
  )

  const results: Array<Error | Array<Result<O>>> = await Promise.all(
    grouped.map(async entries => {
      let queryRunner = entries[0].queryRunner
      let managed = false
      if (!queryRunner) {
        queryRunner = entries[0].connection.createQueryRunner('slave')
        managed = true
      }

      try {
        return await doLoadGrouped(
          queryRunner,
          entries[0].sql,
          entries[0].entityClass,
          entries[0].aliasName,
          entries,
        )
      } catch (error) {
        if (error instanceof Error) {
          return error
        }
        return new Error(error)
      } finally {
        if (managed) {
          await queryRunner.release()
        }
      }
    }),
  )

  return entries.map(({ index }) => {
    const matchedIndex = grouped.findIndex(entries =>
      entries.find(entry => entry.index === index),
    )
    const result = results[matchedIndex]
    if (result instanceof Error) {
      return result
    }
    return result.filter(result => result.index === index)
  })
}

export interface LoaderOptions<Ins extends any[], O> {
  notFoundHandler?: (...ins: Ins) => Error
  dataLoaderOptionsFn?: (
    ...ins: Ins
  ) => DataLoader.Options<Ins, Array<Result<O>>>
  cacheContextFn?: (...ins: Ins) => object
}

function defaultNotFoundHandler(): Error {
  return new Error('Not found')
}

export function loaderProvider<Ins extends any[], O>(
  querier: (...inputs: Ins) => SelectQueryBuilder<O>,
  options?: LoaderOptions<Ins, O>,
): (...inputs: Ins) => DataLoader<Ins, Array<Result<O>>> {
  const cache = new WeakMap<object, DataLoader<Ins, Array<Result<O>>>>()
  return (...inputs) => {
    const cacheContext =
      (options &&
        options.cacheContextFn &&
        options.cacheContextFn(...inputs)) ||
      {}
    const cachedLoader = cache.get(cacheContext)
    if (cachedLoader) {
      return cachedLoader
    }
    const loader = new DataLoader<Ins, Array<Result<O>>>(
      inputs => doLoad(querier, inputs),
      options &&
        options.dataLoaderOptionsFn &&
        options.dataLoaderOptionsFn(...inputs),
    )
    cache.set(cacheContext, loader)
    return loader
  }
}

export type Loader<Ins extends any[], O> = (...ins: Ins) => Promise<O>

export function createLoadMany<Ins extends any[], O>(
  querier: (...inputs: Ins) => SelectQueryBuilder<O>,
  options?: LoaderOptions<Ins, O>,
): Loader<Ins, O[]> {
  const dataLoader = loaderProvider(querier, options)

  return async (...inputs) => {
    const results = await dataLoader(...inputs).load(inputs)
    return results.map(result => result.entity)
  }
}

export function createLoadOne<Ins extends any[], O>(
  querier: (...inputs: Ins) => SelectQueryBuilder<O>,
  options?: LoaderOptions<Ins, O>,
): Loader<Ins, O | undefined> {
  const dataLoader = loaderProvider(
    (...inputs: Ins) => querier(...inputs).limit(1),
    options,
  )

  return async (...inputs) => {
    const results = await dataLoader(...inputs).load(inputs)
    if (!results.length) {
      return undefined
    }
    return results[0].entity
  }
}

export function createGetOne<Ins extends any[], O>(
  querier: (...inputs: Ins) => SelectQueryBuilder<O>,
  options?: LoaderOptions<Ins, O>,
): Loader<Ins, O> {
  const dataLoader = loaderProvider(
    (...inputs: Ins) => querier(...inputs).limit(1),
    options,
  )

  return async (...inputs) => {
    const results = await dataLoader(...inputs).load(inputs)
    if (!results.length) {
      const notFoundHandler: (...inputs: Ins) => Error =
        (options && options.notFoundHandler) || defaultNotFoundHandler
      throw notFoundHandler(...inputs)
    }
    return results[0].entity
  }
}

export function createLoadRawMany<Ins extends any[], O>(
  querier: (...inputs: Ins) => SelectQueryBuilder<O>,
  options?: LoaderOptions<Ins, O>,
): Loader<Ins, any[]> {
  const dataLoader = loaderProvider(querier, options)

  return async (...inputs) => {
    const results = await dataLoader(...inputs).load(inputs)
    return results.map(result => result.raw)
  }
}

export function createLoadRawOne<Ins extends any[], O>(
  querier: (...inputs: Ins) => SelectQueryBuilder<O>,
  options?: LoaderOptions<Ins, O>,
): Loader<Ins, any | undefined> {
  const dataLoader = loaderProvider(
    (...inputs: Ins) => querier(...inputs).limit(1),
    options,
  )

  return async (...inputs) => {
    const results = await dataLoader(...inputs).load(inputs)
    if (!results.length) {
      return undefined
    }
    return results[0].raw
  }
}

export function createGetRawOne<Ins extends any[], O>(
  querier: (...inputs: Ins) => SelectQueryBuilder<O>,
  options?: LoaderOptions<Ins, O>,
): Loader<Ins, O> {
  const dataLoader = loaderProvider(
    (...inputs: Ins) => querier(...inputs).limit(1),
    options,
  )

  return async (...inputs) => {
    const results = await dataLoader(...inputs).load(inputs)
    if (!results.length) {
      const notFoundHandler: (...inputs: Ins) => Error =
        (options && options.notFoundHandler) || defaultNotFoundHandler
      throw notFoundHandler(...inputs)
    }
    return results[0].raw
  }
}
