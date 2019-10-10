import { run } from 'jest-cli/build/cli'
import {
  Column,
  Connection,
  createConnection,
  Entity,
  EntityManager,
  Index,
  PrimaryColumn,
  SelectQueryBuilder,
} from 'typeorm'
import { createLoadMany } from './loader'

@Index(['email'])
@Entity('User')
class User {
  @PrimaryColumn({ type: 'bigint', generated: 'increment' })
  public id!: string

  @Column({ type: 'varchar' })
  public email!: string
}

class UserRepository {
  private static createBuilder(
    em: EntityManager,
    email: string,
  ): SelectQueryBuilder<User> {
    return em.createQueryBuilder(User, 'User').where({ email })
  }

  public readonly findUserByEmailBatch = createLoadMany(
    UserRepository.createBuilder,
  )

  public findUserByEmailNoBatch(
    em: EntityManager,
    email: string,
  ): Promise<User[]> {
    return UserRepository.createBuilder(em, email).getMany()
  }
}

const repository = new UserRepository()

describe('test loader with mysql driver', () => {
  let conn: Connection

  beforeAll(async () => {
    conn = await createConnection({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      database: 'test',
      password: 'password',
      entities: [User],
      synchronize: true,
      dropSchema: true,
    })

    await conn
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({ id: '1', email: 'user1@example.com' })
      .execute()

    await conn
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({ id: '2', email: 'user2@example.com' })
      .execute()

    await conn
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({ id: '3', email: 'user3@example.com' })
      .execute()

    await conn
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({ id: '4', email: 'user4@example.com' })
      .execute()
  })

  afterAll(() => conn.close())

  it('when request with no batch function, it should call query 3 times', async () => {
    const runner = conn.createQueryRunner()

    try {
      const em = conn.createEntityManager(runner)
      const spy = jest.spyOn(runner, 'query')

      const results = await Promise.all([
        repository.findUserByEmailNoBatch(em, 'user1@example.com'),
        repository.findUserByEmailNoBatch(em, 'user2@example.com'),
        repository.findUserByEmailNoBatch(em, 'invalid'),
      ])

      expect(spy).toBeCalledTimes(3)
      expect(spy).toHaveBeenNthCalledWith(
        1,
        'SELECT `User`.`id` AS `User_id`, `User`.`email` AS `User_email` FROM `User` `User` WHERE `User`.`email` = ?',
        ['user1@example.com'],
      )
      expect(spy).toHaveBeenNthCalledWith(
        2,
        'SELECT `User`.`id` AS `User_id`, `User`.`email` AS `User_email` FROM `User` `User` WHERE `User`.`email` = ?',
        ['user2@example.com'],
      )
      expect(spy).toHaveBeenNthCalledWith(
        3,
        'SELECT `User`.`id` AS `User_id`, `User`.`email` AS `User_email` FROM `User` `User` WHERE `User`.`email` = ?',
        ['invalid'],
      )
      expect(results).toEqual([
        [{ id: '1', email: 'user1@example.com' }],
        [{ id: '2', email: 'user2@example.com' }],
        [],
      ])
    } finally {
      await runner.release()
    }
  })

  it('when request with batched function, it should call query only 1 time', async () => {
    const runner = conn.createQueryRunner()

    try {
      const em = conn.createEntityManager(runner)
      const spied = jest.spyOn(runner, 'query')

      const results = await Promise.all([
        repository.findUserByEmailBatch(em, 'user1@example.com'),
        repository.findUserByEmailBatch(em, 'user2@example.com'),
        repository.findUserByEmailBatch(em, 'invalid'),
      ])

      expect(spied).toBeCalledTimes(1)
      expect(spied).toHaveBeenLastCalledWith(
        'SELECT o.*, i.__index__ FROM ((SELECT ? AS `k1`, ? AS `__index__`) UNION ALL (SELECT ? AS `k1`, ? AS `__index__`) UNION ALL (SELECT ? AS `k1`, ? AS `__index__`)) AS `i` INNER JOIN LATERAL (SELECT `User`.`id` AS `User_id`, `User`.`email` AS `User_email` FROM `User` `User` WHERE `User`.`email` = `i`.`k1`) AS `o`',
        ['user1@example.com', 0, 'user2@example.com', 1, 'invalid', 2],
      )
      expect(results).toEqual([
        [{ id: '1', email: 'user1@example.com' }],
        [{ id: '2', email: 'user2@example.com' }],
        [],
      ])
    } finally {
      await runner.release()
    }
  })

  it('when request with multiple query runners, it should call nth times based on number of query runner', async () => {
    const runner0 = conn.createQueryRunner()
    const runner0Spy = jest.spyOn(runner0, 'query')
    const runner1 = conn.createQueryRunner()
    const runner1Spy = jest.spyOn(runner1, 'query')
    const runner2 = conn.createQueryRunner()
    const runner2Spy = jest.spyOn(runner2, 'query')

    try {
      const results = await Promise.all([
        repository.findUserByEmailBatch(runner0.manager, 'user1@example.com'),
        repository.findUserByEmailBatch(runner0.manager, 'user2@example.com'),
        repository.findUserByEmailBatch(runner0.manager, 'invalid'),
        repository.findUserByEmailBatch(runner1.manager, 'user1@example.com'),
        repository.findUserByEmailBatch(runner1.manager, 'user2@example.com'),
      ])

      expect(results).toEqual([
        [{ id: '1', email: 'user1@example.com' }],
        [{ id: '2', email: 'user2@example.com' }],
        [],
        [{ id: '1', email: 'user1@example.com' }],
        [{ id: '2', email: 'user2@example.com' }],
      ])

      expect(runner0Spy).toBeCalledTimes(1)
      expect(runner1Spy).toBeCalledTimes(1)
      expect(runner2Spy).toBeCalledTimes(0)
    } finally {
      await Promise.all([
        runner0.release(),
        runner1.release(),
        runner2.release(),
      ])
    }
  })

  it('when request with conditional query builder, it should call nth times based on number branches generated at runtime', async () => {
    const load = createLoadMany(
      (entityManager: EntityManager, email?: string, id?: string) => {
        let qb = entityManager.createQueryBuilder(User, 'User')
        if (email !== undefined) {
          qb = qb.andWhere('email = :email', { email })
        }
        if (id !== undefined) {
          qb = qb.andWhere('id = :id', { id })
        }
        return qb
      },
    )

    const runner = conn.createQueryRunner()
    const spy = jest.spyOn(runner, 'query')
    try {
      const results = await Promise.all([
        load(runner.manager),
        load(runner.manager, 'user1@example.com'),
        load(runner.manager, 'user2@example.com'),
        load(runner.manager, 'invalid'),
        load(runner.manager, 'user1@example.com', '1'),
        load(runner.manager, 'user2@example.com', '1'),
        load(runner.manager, undefined, '1'),
      ])

      expect(results).toEqual([
        [
          { id: '1', email: 'user1@example.com' },
          { id: '2', email: 'user2@example.com' },
          { id: '3', email: 'user3@example.com' },
          { id: '4', email: 'user4@example.com' },
        ],
        [{ id: '1', email: 'user1@example.com' }],
        [{ id: '2', email: 'user2@example.com' }],
        [],
        [{ id: '1', email: 'user1@example.com' }],
        [],
        [{ id: '1', email: 'user1@example.com' }],
      ])

      expect(spy).toBeCalledTimes(4)
      expect(spy).toHaveBeenNthCalledWith(
        1,
        'SELECT o.*, i.__index__ FROM ((SELECT ? AS `__index__`)) AS `i` INNER JOIN LATERAL (SELECT `User`.`id` AS `User_id`, `User`.`email` AS `User_email` FROM `User` `User`) AS `o`',
        [0],
      )
      expect(spy).toHaveBeenNthCalledWith(
        2,
        'SELECT o.*, i.__index__ FROM ((SELECT ? AS `k1`, ? AS `__index__`) UNION ALL (SELECT ? AS `k1`, ? AS `__index__`) UNION ALL (SELECT ? AS `k1`, ? AS `__index__`)) AS `i` INNER JOIN LATERAL (SELECT `User`.`id` AS `User_id`, `User`.`email` AS `User_email` FROM `User` `User` WHERE email = `i`.`k1`) AS `o`',
        ['user1@example.com', 1, 'user2@example.com', 2, 'invalid', 3],
      )
      expect(spy).toHaveBeenNthCalledWith(
        3,
        'SELECT o.*, i.__index__ FROM ((SELECT ? AS `k1`, ? AS `k2`, ? AS `__index__`) UNION ALL (SELECT ? AS `k1`, ? AS `k2`, ? AS `__index__`)) AS `i` INNER JOIN LATERAL (SELECT `User`.`id` AS `User_id`, `User`.`email` AS `User_email` FROM `User` `User` WHERE email = `i`.`k1` AND id = `i`.`k2`) AS `o`',
        ['user1@example.com', '1', 4, 'user2@example.com', '1', 5],
      )
      expect(spy).toHaveBeenNthCalledWith(
        4,
        'SELECT o.*, i.__index__ FROM ((SELECT ? AS `k1`, ? AS `__index__`)) AS `i` INNER JOIN LATERAL (SELECT `User`.`id` AS `User_id`, `User`.`email` AS `User_email` FROM `User` `User` WHERE id = `i`.`k1`) AS `o`',
        ['1', 6],
      )
    } finally {
      await runner.release()
    }
  })
})
