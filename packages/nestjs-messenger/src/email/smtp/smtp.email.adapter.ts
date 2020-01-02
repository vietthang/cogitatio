import { Optional, Property } from '@cogitatio/core'
import { Default, Port } from '@cogitatio/extra'
import { EmailAddress, SendEmailPayload } from '../dto'
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

  public async sendMessage(payload: SendEmailPayload): Promise<void> {
    const mailer = await import('nodemailer')
    const transport = mailer.createTransport({
      host: this.options.host,
      port: Number(this.options.port),
      auth:
        (this.options.user && {
          user: this.options.user,
          pass: this.options.password,
        }) ||
        undefined,
    })
    await transport.sendMail({
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
    })
  }
}
