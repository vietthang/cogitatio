import { List, Optional, Property, Resolve, TaggedUnion } from '@cogitatio/core'
import { Email } from '@cogitatio/extra'

export const AttachmentBody = TaggedUnion({
  Text: String,
  Binary: Uint8Array,
  Url: URL,
})

export type AttachmentBody = Resolve<typeof AttachmentBody>

export class Attachment {
  @Property(Optional(String))
  public readonly filename?: string

  @Property(Optional(String))
  public readonly contentType?: string

  @Property(AttachmentBody)
  public readonly body!: AttachmentBody
}

export class EmailAddress {
  @Property(Optional(String))
  public readonly name?: string

  @Property(Email)
  public readonly address!: Email
}

export class SendEmailPayload {
  @Property(EmailAddress)
  public readonly from!: EmailAddress

  @Property(Optional(List(EmailAddress)))
  public readonly to?: EmailAddress[]

  @Property(Optional(List(EmailAddress)))
  public readonly cc?: EmailAddress[]

  @Property(Optional(List(EmailAddress)))
  public readonly bcc?: EmailAddress[]

  @Property(Optional(List(EmailAddress)))
  public readonly replyTo?: EmailAddress[]

  @Property(String)
  public readonly subject!: string

  @Property(Optional(String))
  public readonly text?: string

  @Property(Optional(String))
  public readonly html?: string

  @Property(Optional(List(Attachment)))
  public readonly attachments?: Attachment[]
}
