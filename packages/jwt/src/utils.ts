import { Temporal } from '@cogitatio/tc39-temporal'

export function durationToSeconds(duration: Temporal.Duration): number {
  if (duration.months !== 0 || duration.years !== 0) {
    throw new Error('dont support convert duration with months & years yet')
  }
  return duration.hours * 3600 + duration.minutes * 60 + duration.seconds
}
