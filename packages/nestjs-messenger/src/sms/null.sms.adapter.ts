import { SendSmsPayload, SmsAdapter } from './sms.adapter'

export class NullSmsAdapter extends SmsAdapter {
  public sendSms(_: SendSmsPayload): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
