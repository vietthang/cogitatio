declare namespace Temporal {
  export class Absolute {
    constructor(epochNanoseconds: any);

    static from(thing: unknown): Absolute;
    static fromEpochSeconds(arg: number | bigint): Absolute;
    static fromEpochMilliseconds(arg: number | bigint): Absolute;
    static fromEpochMicroseconds(arg: number | bigint): Absolute;
    static fromEpochNanoseconds(arg: number | bigint): Absolute;
    static compare(lhs: Absolute, rhs: Absolute): number;

    toString(): string;
    toJSON(): any;

    getEpochSeconds(): bigint;
    getEpochMilliseconds(): bigint;
    getEpochMicroseconds(): bigint;
    getEpochNanoseconds(): bigint;

    plus(duration: Duration): Absolute;
    minus(duration: Duration): Absolute;
    difference(absolute: Absolute): Absolute;
    inTimeZone(timezone?: any): DateTime;
  }

  // Duration
  export interface DurationLike {
    readonly years: number;
    readonly months: number;
    readonly days: number;
    readonly hours: number;
    readonly minutes: number;
    readonly seconds: number;
    readonly milliseconds: number;
    readonly microseconds: number;
    readonly nanoseconds: number;
  }

  export class Duration implements DurationLike {
    readonly years: number;
    readonly months: number;
    readonly days: number;
    readonly hours: number;
    readonly minutes: number;
    readonly seconds: number;
    readonly milliseconds: number;
    readonly microseconds: number;
    readonly nanoseconds: number;

    constructor(
      years?: number,
      months?: number,
      days?: number,
      hours?: number,
      minutes?: number,
      seconds?: number,
      milliseconds?: number,
      microseconds?: number,
      nanoseconds?: number,
      disambiguation?: 'constrain' | 'balance' | 'reject'
    );

    static from(thing: string | unknown): Duration;
    toString(): string;
    toJSON(): any;
  }

  // Date
  export interface DateLike {
    readonly year: number;
    readonly month: number;
    readonly day: number;
  }

  export class Date implements DateLike {
    readonly year: number;
    readonly month: number;
    readonly day: number;

    constructor(year: number, month: number, day: number, disambiguation?: 'constrain' | 'balance' | 'reject');
    static from(thing: string | unknown): Date;
    static compare(lhs: Date, rhs: Date): number;
    toString(): string;
    toJSON(): any;

    readonly dayOfWeek: number;
    readonly dayOfYear: number;
    readonly weekOfYear: number;
    readonly daysInYear: number;
    readonly daysInMonth: number;
    readonly leapYear: boolean;

    getYearMonth(): any; // TODO
    getMonthDay(): any; // TODO
    plus(duration: Duration, disambiguation?: 'constrain' | 'balance' | 'reject'): Date;
    minus(duration: Duration, disambiguation?: 'constrain' | 'balance' | 'reject'): Date;
    with(thing: DateLike, disambiguation?: 'constrain' | 'balance' | 'reject'): Date;
    difference(date: Date): Duration;
    withTime(time: Time, disambiguation?: 'constrain' | 'balance' | 'reject'): DateTime;
  }

  // Time
  export interface TimeLike {
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    readonly millisecond: number;
    readonly microsecond: number;
    readonly nanosecond: number;
  }

  export class Time implements TimeLike {
    public readonly hour: number;
    public readonly minute: number;
    public readonly second: number;
    public readonly millisecond: number;
    public readonly microsecond: number;
    public readonly nanosecond: number;

    constructor(
      hour: number,
      minute: number,
      second?: number,
      millisecond?: number,
      microsecond?: number,
      nanosecond?: number,
      disambiguation?: 'constrain' | 'balance' | 'reject'
    );
    static from(thing: string | unknown): Time;
    static compare(lhs: Time, rhs: Time): number;
    toString(): string;
    toJSON(): any;

    plus(duration: Duration): Time;
    minus(duration: Duration): Time;
    with(thing: TimeLike, disambiguation?: 'constrain' | 'balance' | 'reject'): Time;
    difference(time: Time): Duration;
    withDate(date: Date, disambiguation?: 'constrain' | 'balance' | 'reject'): DateTime;
  }

  // DateTime
  export interface DateTimeLike extends DateLike, TimeLike {}

  export class DateTime implements DateTimeLike {
    readonly year: number;
    readonly month: number;
    readonly day: number;
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    readonly millisecond: number;
    readonly microsecond: number;
    readonly nanosecond: number;

    constructor(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second?: number,
      millisecond?: number,
      microsecond?: number,
      nanosecond?: number,
      disambiguation?: 'constrain' | 'balance' | 'reject'
    );

    static from(thing: string | unknown): DateTime;
    static compare(lhs: DateTime, rhs: DateTime): number;
    toString(): string;
    toJSON(): any;

    readonly dayOfWeek: number;
    readonly dayOfYear: number;
    readonly weekOfYear: number;
    readonly daysInYear: number;
    readonly daysInMonth: number;
    readonly leapYear: boolean;

    plus(duration: Duration, disambiguation?: 'constrain' | 'balance' | 'reject'): DateTime;
    minus(duration: Duration, disambiguation?: 'constrain' | 'balance' | 'reject'): DateTime;
    with(thing: DateTimeLike, disambiguation?: 'constrain' | 'balance' | 'reject'): DateTime;
    difference(date: DateTime): Duration;

    inTimeZone(timeZoneParam?: any, disambiguation?: 'constrain' | 'balance' | 'reject'): any; // TODO
    getDate(): Date;
    getYearMonth(): any; // TODO
    getMonthDay(): any; // TODO
    getTime(): Time;
  }
}

export = Temporal;
