import { CustomError } from '../exceptions';

export class Result<T = null> {
  constructor(
    private readonly _isSuccess: boolean,
    private readonly _value: T | null = null,
    private readonly _error: CustomError | null = null,
  ) {}

  public static Ok<T>(value?: T): Result<T> {
    return new Result<T>(true, value);
  }

  public static Err<T>(err: CustomError | string): Result<T> {
    let error: CustomError = err as CustomError;

    if (typeof err === 'string') error = new CustomError(err as string);

    return new Result<T>(false, null, error);
  }

  get value(): T {
    return <T>this._value;
  }

  get err(): CustomError {
    return <CustomError>this._error;
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }
}
