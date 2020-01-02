import { Encoder, JsonValue, Property } from '@cogitatio/core'
import { error } from '@cogitatio/errors'
import fetch from 'node-fetch'
import { SendSmsPayload, SmsAdapter } from '../sms.adapter'

export class HttpSmsAdapterOptions {
  @Property(URL)
  public readonly url!: URL
}

export class HttpSmsAdapter extends SmsAdapter {
  constructor(
    private readonly jsonEncoder: Encoder<JsonValue>,
    private readonly options: HttpSmsAdapterOptions,
  ) {
    super()
  }

  public async sendSms(payload: SendSmsPayload): Promise<void> {
    const res = await fetch(this.options.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(this.jsonEncoder.encode(SendSmsPayload, payload)),
    })
    if (!res.ok) {
      throw error({ code: 'POST_FAILED', extra: await res.text() })
    }
  }
}
