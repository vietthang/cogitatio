import { Encoder, JsonValue, Property } from '@cogitatio/core'
import { error } from '@cogitatio/errors'
import fetch from 'node-fetch'
import { PushAdapter, SendNotificationPayload } from '../push.adapter'

export class HttpPushAdapterOptions {
  @Property(URL)
  public readonly url!: URL
}

export class HttpPushAdapter extends PushAdapter {
  constructor(
    private readonly jsonEncoder: Encoder<JsonValue>,
    private readonly options: HttpPushAdapterOptions,
  ) {
    super()
  }

  public async sendMessage(payload: SendNotificationPayload): Promise<void> {
    const res = await fetch(this.options.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(
        this.jsonEncoder.encode(SendNotificationPayload, payload),
      ),
    })
    if (!res.ok) {
      throw error({ code: 'POST_FAILED', extra: await res.text() })
    }
  }
}
