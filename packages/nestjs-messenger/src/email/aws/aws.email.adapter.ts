import { internal } from '@cogitatio/errors'
import fetch from 'node-fetch'
import { Readable } from 'stream'
import { EmailAddress, SendEmailPayload, SendEmailResponse } from '../dto'
import { EmailAdapter } from '../email.adapter'

export class AwsEmailAdapter extends EmailAdapter {
  private static convertEmailAddress(
    address: EmailAddress,
  ): string | import('nodemailer/lib/mailer').Address {
    if (address.name) {
      return {
        name: address.name,
        address: address.address,
      }
    }
    return address.address
  }

  private readonly transport: import('nodemailer/lib/mailer')

  constructor() {
    super()
    const { SES }: typeof import('aws-sdk') = require('aws-sdk')
    const mailer: typeof import('nodemailer') = require('nodemailer')
    this.transport = mailer.createTransport({
      SES: new SES(),
    })
  }

  public async sendMessage(
    payload: SendEmailPayload,
  ): Promise<SendEmailResponse> {
    const res = await this.transport.sendMail({
      from: payload.from && AwsEmailAdapter.convertEmailAddress(payload.from),
      to: payload.to?.map(AwsEmailAdapter.convertEmailAddress),
      cc: payload.cc?.map(AwsEmailAdapter.convertEmailAddress),
      bcc: payload.bcc?.map(AwsEmailAdapter.convertEmailAddress),
      replyTo: payload.replyTo
        ?.map(AwsEmailAdapter.convertEmailAddress)
        .join(', '),
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      attachments:
        payload.attachments &&
        (await Promise.all(
          payload.attachments.map(async attachment => {
            let content: string | Buffer | Readable
            switch (attachment.body.type) {
              case 'Text':
                content = attachment.body.Text
                break
              case 'Binary':
                content = Buffer.from(attachment.body.Binary)
                break
              case 'Url': {
                const res = await fetch(attachment.body.Url)
                if (!res.ok) {
                  throw internal({
                    message: `fetch attachment error`,
                    extra: { status: res.status, body: await res.text() },
                  })
                }
                content = res.body as any
              }
            }

            return {
              filename: attachment.filename,
              contentType: attachment.contentType,
              content,
            }
          }),
        )),
    })

    return { messageId: res.messageId }
  }
}
