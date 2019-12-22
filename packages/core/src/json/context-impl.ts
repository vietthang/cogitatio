import {
  Context,
  failure,
  Validation,
  ValidationError,
  ValidationErrorInit,
} from '../codec'

// @internal
export class ContextImpl implements Context {
  constructor(private readonly paths: Array<string | number> = []) {}

  public child(path: string | number): Context {
    return new ContextImpl(this.paths.concat(path))
  }

  public failure({
    message,
    value,
    rule,
    data,
  }: Omit<ValidationErrorInit, 'paths'>): Validation<any> {
    return failure([
      new ValidationError({
        message,
        value,
        paths: this.paths,
        rule,
        data,
      }),
    ])
  }
}
