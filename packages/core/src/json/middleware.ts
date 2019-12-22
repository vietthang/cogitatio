import { DecodeFunction, EncodeFunction } from '../codec'
import { JsonValue } from './common'

export interface JsonCodecMiddleware {
  encode?: (
    e: EncodeFunction<unknown, JsonValue>,
  ) => EncodeFunction<unknown, JsonValue>
  decode?: (
    d: DecodeFunction<unknown, JsonValue>,
  ) => DecodeFunction<unknown, JsonValue>
}
