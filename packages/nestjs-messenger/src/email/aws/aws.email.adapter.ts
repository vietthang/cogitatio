import { EmailAddress, SendEmailPayload } from '../dto'
import { EmailAdapter } from '../email.adapter'

export class AwsEmailAdapter extends EmailAdapter {
  private static formatEmailAddress(address: EmailAddress): string {
    if (address.name) {
      return `${address.name} <${address.address}>`
    }
    return address.address
  }
  private readonly ses: import('aws-sdk').SES

  constructor() {
    super()
    const { SES }: typeof import('aws-sdk') = require('aws-sdk')
    this.ses = new SES()
  }

  public async sendMessage(payload: SendEmailPayload): Promise<void> {
    const request: import('aws-sdk').SES.Types.SendEmailRequest = {
      Source: AwsEmailAdapter.formatEmailAddress(payload.from),
      Message: {
        Subject: {
          Data: payload.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html:
            (payload.html && {
              Data: payload.html,
              Charset: 'UTF-8',
            }) ||
            undefined,
          Text:
            (payload.text && {
              Data: payload.text,
              Charset: 'UTF-8',
            }) ||
            undefined,
        },
      },
      Destination: {
        ToAddresses: payload.to?.map(AwsEmailAdapter.formatEmailAddress),
        CcAddresses: payload.cc?.map(AwsEmailAdapter.formatEmailAddress),
        BccAddresses: payload.bcc?.map(AwsEmailAdapter.formatEmailAddress),
      },
      ReplyToAddresses: payload.replyTo?.map(
        AwsEmailAdapter.formatEmailAddress,
      ),
    }

    await this.ses.sendEmail(request).promise()
  }
}
