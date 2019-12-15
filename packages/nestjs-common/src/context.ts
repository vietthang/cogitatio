export type TypedKey<T> = string & { __type: T }

export type ExtractType<T> = T extends TypedKey<infer U>
  ? U
  : T extends string
  ? any
  : never

export class Context {
  public static background = new Context()

  public static todo = new Context()

  private constructor(
    private readonly parent?: Context,
    private readonly values: { [key: string]: unknown } = {},
  ) {}

  public value<T = any, D extends T | undefined = undefined>(
    key: TypedKey<T>,
    defaultValue?: D,
  ): T | D {
    const maybeValue = this.values[key]
    if (maybeValue !== undefined) {
      return maybeValue as D
    }
    if (this.parent) {
      return this.parent.value(key, defaultValue)
    }
    return defaultValue as D
  }

  public withValue<T = any>(key: TypedKey<T>, value: T): Context {
    return new Context(this, { [key]: value })
  }
}
