import { Dictionary, List, Optional, Property } from '@cogitatio/core'

export class ApsAlert {
  @Property(Optional(String))
  public readonly title?: string

  @Property(Optional(String))
  public readonly subtitle?: string

  @Property(Optional(String))
  public readonly body?: string

  @Property(Optional(String))
  public readonly locKey?: string

  @Property(Optional(List(String)))
  public readonly locArgs?: string[]

  @Property(Optional(String))
  public readonly titleLocKey?: string

  @Property(Optional(List(String)))
  public readonly titleLocArgs?: string[]

  @Property(Optional(String))
  public readonly subtitleLocKey?: string

  @Property(Optional(List(String)))
  public readonly subtitleLocArgs?: string[]

  @Property(Optional(String))
  public readonly actionLocKey?: string

  @Property(Optional(String))
  public readonly launchImage?: string
}

/**
 * Represents a critical sound configuration that can be included in the
 * `aps` dictionary of an APNs payload.
 */
export class CriticalSound {
  /**
   * The critical alert flag. Set to `true` to enable the critical alert.
   */
  @Property(Optional(Boolean))
  public readonly critical?: boolean

  /**
   * The name of a sound file in the app's main bundle or in the `Library/Sounds`
   * folder of the app's container directory. Specify the string "default" to play
   * the system sound.
   */
  @Property(String)
  public readonly name!: string

  /**
   * The volume for the critical alert's sound. Must be a value between 0.0
   * (silent) and 1.0 (full volume).
   */
  @Property(Optional(Number))
  public readonly volume?: number
}

/**
 * Represents the [aps dictionary](https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/PayloadKeyReference.html)
 * that is part of APNs messages.
 */
export class Aps {
  /**
   * Alert to be included in the message. This may be a string or an object of
   * type `admin.messaging.ApsAlert`.
   */
  @Property(Optional(ApsAlert))
  public readonly alert?: ApsAlert

  /**
   * Badge to be displayed with the message. Set to 0 to remove the badge. When
   * not specified, the badge will remain unchanged.
   */
  @Property(Optional(BigInt))
  public readonly badge?: bigint

  /**
   * Sound to be played with the message.
   */
  @Property(Optional(CriticalSound))
  public readonly sound?: CriticalSound

  /**
   * Specifies whether to configure a background update notification.
   */
  @Property(Optional(Boolean))
  public readonly contentAvailable?: boolean

  /**
   * Specifies whether to set the `mutable-content` property on the message
   * so the clients can modify the notification via app extensions.
   */
  @Property(Optional(Boolean))
  public readonly mutableContent?: boolean

  /**
   * Type of the notification.
   */
  @Property(Optional(String))
  public readonly category?: string

  /**
   * An app-specific identifier for grouping notifications.
   */
  @Property(Optional(String))
  public readonly threadId?: string
}

/**
 * Represents the payload of an APNs message. Mainly consists of the `aps`
 * dictionary. But may also contain other arbitrary custom keys.
 */
export class ApnsPayload {
  /**
   * The `aps` dictionary to be included in the message.
   */
  @Property(Aps)
  public readonly aps!: Aps;

  [customData: string]: object // TODO @cogitatio/core do not support this pattern yet
}

/**
 * Represents the APNs-specific options that can be included in an
 * {@link admin.messaging.Message}. Refer to
 * [Apple documentation](https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CommunicatingwithAPNs.html)
 * for various headers and payload fields supported by APNs.
 */
export class ApnsConfig {
  /**
   * A collection of APNs headers. Header values must be strings.
   */
  @Property(Optional(Dictionary(String)))
  public readonly headers?: { [key: string]: string }

  /**
   * An APNs payload to be included in the message.
   */
  @Property(Optional(ApnsPayload))
  public readonly payload?: ApnsPayload
}
