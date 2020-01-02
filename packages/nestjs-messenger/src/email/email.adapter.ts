import { SendEmailPayload } from './dto'

export abstract class EmailAdapter {
  public abstract sendMessage(payload: SendEmailPayload): Promise<void>
}
