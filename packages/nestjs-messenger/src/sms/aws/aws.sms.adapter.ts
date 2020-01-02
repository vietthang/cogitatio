import { SendSmsPayload, SmsAdapter } from '../sms.adapter'

export class AwsSmsAdapter extends SmsAdapter {
  private readonly sns: import('aws-sdk').SNS

  constructor() {
    super()
    const { SNS }: typeof import('aws-sdk') = require('aws-sdk')
    this.sns = new SNS()
  }

  public async sendSms(payload: SendSmsPayload): Promise<void> {
    const { PhoneNumberFormat, PhoneNumberUtil } = await import(
      'google-libphonenumber'
    )
    await Promise.all(
      payload.recipients.map(async recipient => {
        await this.sns
          .publish({
            PhoneNumber: PhoneNumberUtil.getInstance().format(
              recipient,
              PhoneNumberFormat.E164,
            ),
            Message: payload.content,
            MessageAttributes: {
              'AWS.SNS.SMS.SMSType': {
                DataType: 'String',
                // TODO force transaction for now, maybe we should provide some hint mechanism?
                StringValue: 'Transactional',
              },
              ...(payload.senderId
                ? {
                    'AWS.SNS.SMS.SenderID': {
                      DataType: 'String',
                      StringValue: payload.senderId,
                    },
                  }
                : {}),
            },
          })
          .promise()
      }),
    )
  }
}
