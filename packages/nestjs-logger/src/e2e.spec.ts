import {
  Context,
  RequestId,
  RequestIdContextKey,
} from '@cogitatio/nestjs-common'
import { Injectable } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import Transport from 'winston-transport'
import { InjectLogger, Logger, LoggerModule } from './index'

describe('e2e', () => {
  @Injectable()
  class TestService {
    constructor(
      @InjectLogger(TestService)
      public readonly logger: Logger,
    ) {}

    public hello(): void {
      this.logger.info(Context.background, 'Hello')
      this.logger.debug(Context.background, 'Hello')
    }

    public logWithMeta(): void {
      this.logger.info(
        Context.background.withValue(RequestIdContextKey, 'foo' as RequestId),
        'Hello',
        {
          exception: new Error('My Error'),
          labels: ['foo'],
          foo: 'bar',
        },
      )
    }
  }

  it('e2e', async () => {
    class NullTransport extends Transport {
      public log(_: any, next: () => void) {
        next()

        return this
      }
    }

    const transport = new NullTransport()
    const logSpy = jest.spyOn(transport, 'log')
    const module = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          transports: [transport],
        }),
      ],
      providers: [TestService],
      exports: [TestService],
    }).compile()

    const testService = module.get(TestService)
    expect(testService).toBeDefined()
    expect(testService.logger).toBeDefined()
    testService.hello()
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toMatchObject({
      level: 'info',
      message: 'Hello',
      module: 'TestService',
    })
    expect(typeof logSpy.mock.calls[0][1]).toBe('function')

    testService.logWithMeta()
    expect(logSpy).toHaveBeenCalledTimes(2)
    expect(logSpy.mock.calls[1][0]).toMatchObject({
      level: 'info',
      message: 'Hello',
      module: 'TestService',
      labels: ['foo'],
      meta: { foo: 'bar' },
      exception: { code: 'UNKNOWN_ERROR', status: 500, message: 'My Error' },
    })
    expect(typeof logSpy.mock.calls[1][1]).toBe('function')
  })
})
