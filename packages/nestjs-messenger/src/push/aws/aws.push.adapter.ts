import { Encoder, JsonValue } from '@cogitatio/core'
import {
  MessagePayload,
  PushAdapter,
  SendNotificationPayload,
} from '../push.adapter'

export class AwsPushAdapter extends PushAdapter {
  private readonly sns: import('aws-sdk').SNS

  constructor(private readonly jsonEncoder: Encoder<JsonValue>) {
    super()
    const { SNS }: typeof import('aws-sdk') = require('aws-sdk')
    this.sns = new SNS()
  }

  public async sendMessage(payload: SendNotificationPayload): Promise<void> {
    await Promise.all(
      payload.tokens.map(async token => {
        await this.sns
          .publish({
            TargetArn: token,
            Message: JSON.stringify(
              // TODO not entirely correct way to send
              this.jsonEncoder.encode(MessagePayload, payload.message),
            ),
          })
          .promise()
      }),
    )
  }
}
