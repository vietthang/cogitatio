import { Optional, Property } from '@cogitatio/core'
import { internal } from '@cogitatio/errors'
import { Default, Port } from '@cogitatio/extra'
import fetch from 'node-fetch'
import { Readable } from 'stream'
import { EmailAddress, SendEmailPayload, SendEmailResponse } from '../dto'
import { EmailAdapter } from '../email.adapter'

export class SmtpEmailAdapterOptions {
  @Property(String)
  public host!: string

  @Property(Port)
  public port!: Port

  @Property(Default(false, Boolean))
  public readonly secure!: boolean

  @Property(Optional(String))
  public readonly user?: string

  @Property(Optional(String))
  public readonly password?: string
}

export class SmtpEmailAdapter extends EmailAdapter {
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

  constructor(private readonly options: SmtpEmailAdapterOptions) {
    super()
  }

  public async sendMessage(
    payload: SendEmailPayload,
  ): Promise<SendEmailResponse> {
    const mailer = await import('nodemailer')
    const transport = mailer.createTransport({
      host: this.options.host,
      port: Number(this.options.port),
      secure: this.options.secure,
      auth:
        (this.options.user && {
          user: this.options.user,
          pass: this.options.password,
        }) ||
        undefined,
    })

    const res = await transport.sendMail({
      from: payload.from && SmtpEmailAdapter.convertEmailAddress(payload.from),
      to: payload.to?.map(SmtpEmailAdapter.convertEmailAddress),
      cc: payload.cc?.map(SmtpEmailAdapter.convertEmailAddress),
      bcc: payload.bcc?.map(SmtpEmailAdapter.convertEmailAddress),
      replyTo: payload.replyTo
        ?.map(SmtpEmailAdapter.convertEmailAddress)
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
