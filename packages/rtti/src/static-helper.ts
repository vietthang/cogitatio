// tslint:disable

// @internal
export type _globalThis = typeof globalThis

// @internal
export type _Buffer = typeof global

// @internal
declare global {
  interface ReadonlyArray<T> {}

  interface ReadonlySet<T> {}

  interface ReadonlyMap<K, V> {}

  interface Buffer {}
}
