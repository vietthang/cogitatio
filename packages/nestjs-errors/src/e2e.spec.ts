import { badRequest } from '@cogitatio/errors'
import {
  BadRequestException,
  Controller,
  Get,
  INestApplication,
} from '@nestjs/common'
import { GraphQLModule, Query, Resolver } from '@nestjs/graphql'
import { ExpressAdapter } from '@nestjs/platform-express'
import { Test } from '@nestjs/testing'
import express from 'express'
import fetch from 'node-fetch'
import { ErrorsModule } from './module'

describe('AllExceptionsFilter', () => {
  let app: INestApplication
  let e: express.Express
  let port: number

  beforeAll(async () => {
    @Controller('/test')
    class TestController {
      @Get('/http-exception')
      public getHttpException() {
        throw new BadRequestException('bad request')
      }

      @Get('/wrapped-error')
      public getWrappedError() {
        throw badRequest()
      }

      @Get('/normal-error')
      public getNormalError() {
        throw new Error('normal error')
      }

      @Get('/string')
      public getString() {
        // tslint:disable-next-line
        throw 'string'
      }
    }

    @Resolver()
    class TestResolver {
      @Query()
      public getHttpException() {
        throw new BadRequestException('bad request')
      }

      @Query()
      public getWrappedError() {
        throw badRequest()
      }

      @Query()
      public getNormalError() {
        throw new Error('normal error')
      }

      @Query()
      public getString() {
        // tslint:disable-next-line
        throw 'string'
      }
    }

    const module = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot({
          typeDefs: `
            type Query {
              getHttpException: Boolean
              getWrappedError: Boolean
              getNormalError: Boolean
              getString: Boolean
            }
          `,
        }),
        ErrorsModule.forRoot({}),
      ],
      controllers: [TestController],
      providers: [TestResolver],
    }).compile()

    e = express()
    app = module.createNestApplication(new ExpressAdapter(e), {
      bodyParser: true,
    })
    const server = await app.listen(0)
    port = server.address().port
  })

  afterAll(async () => {
    await app.close()
  })

  describe('http', () => {
    it('should return correctly when throw http exception', async () => {
      const res = await fetch(`http://localhost:${port}/test/http-exception`)
      expect(res.status).toEqual(400)
      expect(await res.json()).toStrictEqual({
        error: 'Bad Request',
        message: 'bad request',
        statusCode: 400,
      })
    })

    it('should return correctly when throw wrapped error', async () => {
      const res = await fetch(`http://localhost:${port}/test/wrapped-error`)
      expect(res.status).toEqual(400)
      const { stack, ...rest } = await res.json()
      expect(rest).toMatchObject({
        code: 'GENERIC_BAD_REQUEST',
        message: 'Bad Request',
        status: 400,
      })
    })

    it('should return correctly when throw normal error', async () => {
      const res = await fetch(`http://localhost:${port}/test/normal-error`)
      expect(res.status).toEqual(500)
      const { stack, ...rest } = await res.json()
      expect(rest).toStrictEqual({
        code: 'INTERNAL_ERROR',
        message: 'normal error',
        status: 500,
      })
    })

    it('should return correctly when throw string', async () => {
      const res = await fetch(`http://localhost:${port}/test/string`)
      expect(res.status).toEqual(500)
      const { stack, ...rest } = await res.json()
      expect(rest).toStrictEqual({
        code: 'INTERNAL_ERROR',
        message: 'unknown error',
        status: 500,
        extra: 'string',
      })
    })
  })

  describe('graphql', () => {
    const query = async (q: string) => {
      const url = new URL(`http://localhost:${port}/graphql`)
      url.searchParams.append('query', `{ ${q} }`)
      return fetch(url.href)
    }

    it('should return correctly when throw http exception', async () => {
      const res = await query('getHttpException')
      expect(res.status).toEqual(200)
      expect(await res.json()).toStrictEqual({
        errors: [
          {
            message: 'bad request',
            locations: [{ line: 1, column: 3 }],
            path: ['getHttpException'],
            extensions: { code: 'HTTP_400' },
          },
        ],
        data: { getHttpException: null },
      })
    })

    it('should return correctly when throw wrapped exception', async () => {
      const res = await query('getWrappedError')
      expect(res.status).toEqual(200)
      expect(await res.json()).toMatchObject({
        errors: [
          {
            message: 'Bad Request',
            locations: [{ line: 1, column: 3 }],
            path: ['getWrappedError'],
            extensions: {
              code: 'GENERIC_BAD_REQUEST',
              exception: { status: 400 },
              status: 400,
            },
          },
        ],
        data: { getWrappedError: null },
      })
    })

    it('should return correctly when throw normal error', async () => {
      const res = await query('getNormalError')
      expect(res.status).toEqual(200)
      expect(await res.json()).toMatchObject({
        errors: [
          {
            message: 'normal error',
            locations: [{ line: 1, column: 3 }],
            path: ['getNormalError'],
            extensions: {
              code: 'INTERNAL_ERROR',
              exception: { status: 500 },
              status: 500,
            },
          },
        ],
        data: { getNormalError: null },
      })
    })

    it('should return correctly when throw string', async () => {
      const res = await query('getString')
      expect(res.status).toEqual(200)
      expect(await res.json()).toMatchObject({
        errors: [
          {
            message: 'unknown error',
            locations: [{ line: 1, column: 3 }],
            path: ['getString'],
            extensions: {
              code: 'INTERNAL_ERROR',
              exception: { status: 500 },
              status: 500,
            },
          },
        ],
        data: { getString: null },
      })
    })
  })
})
