import { Dictionary, Enum, List, Optional, Property } from '@cogitatio/core'
import { Temporal } from '@cogitatio/tc39-temporal'

/**
 * Represents the Android-specific notification options that can be included in
 * {@link admin.messaging.AndroidConfig}.
 */
export class AndroidNotification {
  /**
   * Title of the Android notification. When provided, overrides the title set via
   * `admin.messaging.Notification`.
   */
  @Property(Optional(String))
  public readonly title?: string

  /**
   * Body of the Android notification. When provided, overrides the body set via
   * `admin.messaging.Notification`.
   */
  @Property(Optional(String))
  public readonly body?: string

  /**
   * Icon resource for the Android notification.
   */
  @Property(Optional(String))
  public readonly icon?: string

  /**
   * Notification icon color in `#rrggbb` format.
   */
  @Property(Optional(String))
  public readonly color?: string

  /**
   * File name of the sound to be played when the device receives the
   * notification.
   */
  @Property(Optional(String))
  public readonly sound?: string

  /**
   * Notification tag. This is an identifier used to replace existing
   * notifications in the notification drawer. If not specified, each request
   * creates a new notification.
   */
  @Property(Optional(String))
  public readonly tag?: string

  /**
   * Action associated with a user click on the notification. If specified, an
   * activity with a matching Intent Filter is launched when a user clicks on the
   * notification.
   */
  @Property(Optional(String))
  public readonly clickAction?: string

  /**
   * Key of the body string in the app's string resource to use to localize the
   * body text.
   *
   */
  @Property(Optional(String))
  public readonly bodyLocKey?: string

  /**
   * An array of resource keys that will be used in place of the format
   * specifiers in `bodyLocKey`.
   */
  @Property(Optional(List(String)))
  public readonly bodyLocArgs?: string[]

  /**
   * Key of the title string in the app's string resource to use to localize the
   * title text.
   */
  @Property(Optional(String))
  public readonly titleLocKey?: string

  /**
   * An array of resource keys that will be used in place of the format
   * specifiers in `titleLocKey`.
   */
  @Property(Optional(List(String)))
  public readonly titleLocArgs?: string[]

  /**
   * The Android notification channel ID (new in Android O). The app must create
   * a channel with this channel ID before any notification with this channel ID
   * can be received. If you don't send this channel ID in the request, or if the
   * channel ID provided has not yet been created by the app, FCM uses the channel
   * ID specified in the app manifest.
   */
  @Property(Optional(String))
  public readonly channelId?: string
}

export enum AndroidConfigPriority {
  high = 'high',
  normal = 'normal',
}

/**
 * Represents the Android-specific options that can be included in an
 * {@link admin.messaging.Message}.
 */
export class AndroidConfig {
  /**
   * Collapse key for the message. Collapse key serves as an identifier for a
   * group of messages that can be collapsed, so that only the last message gets
   * sent when delivery can be resumed. A maximum of four different collapse keys
   * may be active at any given time.
   */
  @Property(Optional(String))
  public readonly collapseKey?: string

  /**
   * Priority of the message. Must be either `normal` or `high`.
   */
  @Property(Optional(Enum(AndroidConfigPriority)))
  public readonly priority?: AndroidConfigPriority

  /**
   * Time-to-live duration of the message in milliseconds.
   */
  @Property(Optional(Temporal.Duration))
  public readonly ttl?: Temporal.Duration

  /**
   * Package name of the application where the registration tokens must match
   * in order to receive the message.
   */
  @Property(Optional(String))
  public readonly restrictedPackageName?: string

  /**
   * A collection of data fields to be included in the message. All values must
   * be strings. When provided, overrides any data fields set on the top-level
   * `admin.messaging.Message`.}
   */
  @Property(Optional(Dictionary(String)))
  public readonly data?: { [key: string]: string }

  /**
   * Android notification to be included in the message.
   */
  @Property(Optional(AndroidNotification))
  public readonly notification?: AndroidNotification
}
