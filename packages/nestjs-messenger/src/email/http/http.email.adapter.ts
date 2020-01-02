import { Encoder, JsonValue, Property } from '@cogitatio/core'
import { error } from '@cogitatio/errors'
import fetch from 'node-fetch'
import { SendEmailPayload } from '../dto'
import { EmailAdapter } from '../email.adapter'

export class HttpEmailAdapterOptions {
  @Property(URL)
  public readonly url!: URL
}

export class HttpEmailAdapter extends EmailAdapter {
  constructor(
    private readonly jsonEncoder: Encoder<JsonValue>,
    private readonly options: HttpEmailAdapterOptions,
  ) {
    super()
  }

  public async sendMessage(payload: SendEmailPayload): Promise<void> {
    const res = await fetch(this.options.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(this.jsonEncoder.encode(SendEmailPayload, payload)),
    })
    if (!res.ok) {
      throw error({ code: 'POST_FAILED', extra: await res.text() })
    }
  }
}
