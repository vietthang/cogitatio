import Knex from 'knex'
import { queryBatch } from './loader'

describe('test loader', () => {
  let k: Knex

  beforeAll(async () => {
    k = Knex({
      client: 'pg',
      connection: {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        database: 'postgres',
        password: 'password',
      },
    })

    await k.schema.dropTableIfExists('User')
    await k.schema.createTable('User', table => {
      table
        .bigIncrements('id')
        .notNullable()
        .primary()
      table.string('email').notNullable()
    })

    await k.table('User').insert({ email: 'user0@example.com' })
    await k.table('User').insert({ email: 'user1@example.com' })
    await k.table('User').insert({ email: 'user2@example.com' })
    await k.table('User').insert({ email: 'user3@example.com' })
  })

  afterAll(() => k.destroy())

  it('when request with multiple load, it should handle correctly', async () => {
    await k.transaction(async k0 => {
      interface Input {
        email: string
      }

      const querier = (
        q: Knex,
        { email }: { [key in keyof Input]: Knex.Raw<Input[key]> },
      ) =>
        q
          .select('User.*')
          .from('User')
          .where('email', email)

      const load = (input: Input) => queryBatch(querier, k0, input)

      const eventHandler = jest.fn()

      k0.on('query', eventHandler)

      const [u0, u1, u2] = await Promise.all([
        load({
          email: 'user0@example.com',
        }),
        load({
          email: 'user1@example.com',
        }),
        load({
          email: 'invalid',
        }),
      ])

      expect(eventHandler).toHaveBeenCalledTimes(1)
      expect(eventHandler.mock.calls[0][0]).toMatchObject({
        sql:
          'select "o".*, "i"."__index__" from (values (?, ?), (?, ?), (?, ?)) as "i" ("email", "__index__") inner join lateral (select "User".* from "User" where "email" = "i"."email") as "o" on ? ',
        bindings: [
          'user0@example.com',
          0,
          'user1@example.com',
          1,
          'invalid',
          2,
          true,
        ],
      })
      expect(u0).toStrictEqual([{ id: '1', email: 'user0@example.com' }])
      expect(u1).toStrictEqual([{ id: '2', email: 'user1@example.com' }])
      expect(u2).toStrictEqual([])
    })
  })
})
