import DataLoader from 'dataloader'
import {
  Connection,
  ObjectType,
  QueryRunner,
  SelectQueryBuilder,
} from 'typeorm'
import { DriverUtils } from 'typeorm/driver/DriverUtils'
import { Either, groupBy, left, objectSerializer, right } from './utils'

function obtainQueryRunner(
  qb: SelectQueryBuilder<any>,
  ioQueryRunner: () => QueryRunner,
): QueryRunner {
  return (qb as any).queryRunner || ioQueryRunner
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
    params: any[]
    index: number
  }>,
): Promise<Array<Result<T>>> {
  let currentId = 1
  const ioId = () => `k${(currentId++).toString()}`

  const escape = (name: string): string =>
    queryRunner.connection.driver.escape(name)

  let joinFrag = sql
  const joinBindings: any[] = []
  const keys = new Array(entries[0].params.length)
  for (let i = 0; i < keys.length; i++) {
    keys[i] = ioId()
    joinFrag = joinFrag.replace(/\?/, `${escape('i')}.${escape(keys[i])}`)
  }

  const selectFrag = `o.*, i.__index__`
  const selectBindings: any[] = []
  const fromFrag = entries
    .map(
      () =>
        `(SELECT ${keys
          .map(key => `? AS ${escape(key)}`)
          .concat(`? AS ${escape('__index__')}`)
          .join(', ')})`,
    )
    .join(' UNION ALL ')
  const fromBindings = entries.flatMap(({ params, index }) =>
    params.concat(index),
  )

  const finalSql = `SELECT ${selectFrag} FROM (${fromFrag}) AS ${escape(
    'i',
  )} INNER JOIN LATERAL (${joinFrag}) AS ${escape('o')}`
  const finalBindings = [...selectBindings, ...fromBindings, ...joinBindings]

  const results: any[] = await queryRunner.query(finalSql, finalBindings)

  return results.map(({ __index__, ...raw }) => {
    const entity = merge<T>(queryRunner.connection, entityClass, aliasName, raw)
    const index = Number(__index__)
    return { entity, index, raw }
  })
}

async function doLoad<Ins extends any[], O>(
  querier: (...inputs: Ins) => SelectQueryBuilder<O>,
  inputs: Ins[],
): Promise<Array<Array<Result<O>> | Error>> {
  let queryRunner: QueryRunner | undefined
  const queryRunnerGetter = (connection: Connection) =>
    (queryRunner = queryRunner || connection.createQueryRunner('slave'))

  const entries = inputs
    .map(args => querier(...args))
    .map((qb, index) => {
      const queryRunner = obtainQueryRunner(qb, () =>
        queryRunnerGetter(qb.connection),
      )
      const [sql, params] = qb.getQueryAndParameters()
      const mainAlias = qb.expressionMap.mainAlias
      if (!mainAlias) {
        throw new Error('TODO misssing main alias')
      }
      if (typeof mainAlias.target !== 'function') {
        throw new Error('TODO target is not class')
      }

      return {
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
    ({ sql, queryRunner, entityClass, aliasName }) => {
      return [
        objectSerializer(queryRunner),
        sql,
        objectSerializer(entityClass),
        aliasName,
      ].join('\0')
    },
  )

  const results: Array<Either<Error, Array<Result<O>>>> = await Promise.all(
    grouped.map(entries =>
      doLoadGrouped(
        entries[0].queryRunner,
        entries[0].sql,
        entries[0].entityClass,
        entries[0].aliasName,
        entries,
      )
        .then(right)
        .catch(error => {
          if (error instanceof Error) {
            return left(error)
          }
          return left(new Error(error))
        }),
    ),
  )

  return entries.map(({ index }) => {
    const matchedIndex = grouped.findIndex(entries =>
      entries.find(entry => entry.index === index),
    )
    const result = results[matchedIndex]
    if (result.__either === 'Left') {
      return result.value
    }
    return result.value.filter(result => result.index === index)
  })
}

function createDataLoader<Ins extends any[], O>(
  querier: (...inputs: Ins) => SelectQueryBuilder<O>,
  dataLoaderOptions?: DataLoader.Options<Ins, Array<Result<O>>>,
): DataLoader<Ins, Array<Result<O>>> {
  return new DataLoader<Ins, Array<Result<O>>>(
    inputs => doLoad(querier, inputs),
    dataLoaderOptions,
  )
}

export type Loader<Ins extends any[], O> = (...ins: Ins) => Promise<O>

export function createLoadMany<Ins extends any[], O>(
  querier: (...inputs: Ins) => SelectQueryBuilder<O>,
  dataLoaderOptions?: DataLoader.Options<Ins, Array<Result<O>>>,
): Loader<Ins, O[]> {
  const dataLoader = createDataLoader(querier, dataLoaderOptions)

  return async (...values) => {
    const results = await dataLoader.load(values)
    return results.map(result => result.entity)
  }
}

export function createLoadOne<Ins extends any[], O>(
  querier: (...inputs: Ins) => SelectQueryBuilder<O>,
  dataLoaderOptions?: DataLoader.Options<Ins, Array<Result<O>>>,
): Loader<Ins, O | undefined> {
  const dataLoader = createDataLoader(querier, dataLoaderOptions)

  return async (...values) => {
    const results = await dataLoader.load(values)
    if (!results.length) {
      return undefined
    }
    return results[0].entity
  }
}

export function createLoadRawMany<Ins extends any[], O>(
  querier: (...inputs: Ins) => SelectQueryBuilder<O>,
  dataLoaderOptions?: DataLoader.Options<Ins, Array<Result<O>>>,
): Loader<Ins, any[]> {
  const dataLoader = createDataLoader(querier, dataLoaderOptions)

  return async (...values) => {
    const results = await dataLoader.load(values)
    return results.map(result => result.raw)
  }
}

export function createLoadRawOne<Ins extends any[], O>(
  querier: (...inputs: Ins) => SelectQueryBuilder<O>,
  dataLoaderOptions?: DataLoader.Options<Ins, Array<Result<O>>>,
): Loader<Ins, any | undefined> {
  const dataLoader = createDataLoader(querier, dataLoaderOptions)

  return async (...values) => {
    const results = await dataLoader.load(values)
    if (!results.length) {
      return undefined
    }
    return results[0].raw
  }
}
