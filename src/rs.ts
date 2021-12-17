interface ResultPattern<T, E, O> {
  Ok(val: T): O;
  Err(err: E): O;
}

interface OptionPattern<T, O> {
  Some(val: T): O;
  None(): O;
}

export function Ok<T>(val: T): Result<T> {
  return new Result(val);
}

export function Err<E extends Error>(err: E): Result<never, E> {
  return new Result(err) as Result<never, E>;
}

export function Some<T>(val: T): Option<T> {
  return new Option(val);
}

export function None(): Option<never> {
  return new Option();
}

export class Result<T, E extends Error = Error> {
  readonly #val: T | E;

  public constructor(val: T | E) {
    this.#val = val;
  }

  /**
   * Emulates Rust's pattern matching syntax.
   */
  public match<O>(pattern: ResultPattern<T, E, O>): O {
    const val = this.#val;
    return this.isOk() ? pattern.Ok(val as T) : pattern.Err(val as E);
  }

  /**
   * Returns res if the result is Ok, otherwise returns the Err value of self.
   */
  public and<U>(res: Result<U, E>): Result<U, E> {
    return this.match({
      Ok: () => res,
      Err: () => this as any,
    });
  }

  /**
   * Calls op if the result is Ok, otherwise returns the Err value of self.
   * This function can be used for control flow based on Result values.
   */
  public andThen<U>(op: (val: T) => Result<U, E>): Result<U, E> {
    return this.match({
      Ok: (val) => op(val),
      Err: () => this as any,
    });
  }

  /**
   * Returns true if the result is an Ok value containing the given value.
   */
  public contains(x: T): boolean {
    return this.match({
      Ok: (val) => val === x,
      Err: () => false,
    });
  }

  /**
   * Returns true if the result is an Err value containing the given value.
   */
  public containsErr(msg: string): boolean {
    return this.match({
      Ok: () => false,
      Err: (err) => err.message === msg,
    });
  }

  /**
   * Converts from Result<T, E> to Option<E>.
   */
  public err(): Option<E> {
    return this.match({
      Ok: () => None(),
      Err: (err) => Some(err),
    });
  }

  /**
   * Returns the contained Ok value, consuming the self value.
   * Panics if the value is an Err, with a panic message including the passed message, and the content of the Err.
   */
  public expect(msg: string): T {
    return this.match({
      Ok: (val) => val,
      Err: () => {
        throw new Error(msg);
      },
    });
  }

  /**
   * Returns true if the result is Err.
   */
  public isErr(): this is Result<never, E> {
    return this.#val instanceof Error;
  }

  /**
   * Returns true if the result is Ok.
   */
  public isOk(): this is Result<T> {
    return !this.isErr();
  }

  /**
   * Maps a Result<T, E> to Result<U, E> by applying a function to a contained Ok value, leaving an Err value untouched.
   * This function can be used to compose the results of two functions.
   */
  public map<U>(op: (val: T) => U): Result<U, E> {
    return this.match({
      Ok: (val) => new Result(op(val)) as Result<U, E>,
      Err: () => this as any,
    });
  }

  /**
   * Returns the provided fallback (if Err), or applies a function to the contained value (if Ok).
   */
  public mapOr<U>(fallback: U, op: (val: T) => U): Result<U, E> {
    return this.match({
      Ok: (val) => new Result(op(val)) as Result<U, E>,
      Err: () => new Result(fallback) as Result<U, E>,
    });
  }

  /**
   * Maps a Result<T, E> to U by applying fallback function default to a contained Err value,
   * or function f to a contained Ok value.
   */
  public mapOrElse<U>(fallback: (err: E) => U, f: (val: T) => U): U {
    return this.match({
      Ok: (val) => f(val),
      Err: (err) => fallback(err),
    });
  }

  /**
   * Converts from Result<T, E> to Option<T>.
   */
  public ok(): Option<T> {
    return this.match({
      Ok: (val) => Some(val),
      Err: () => None(),
    });
  }

  /**
   * Returns res if the result is Err, otherwise returns the Ok value of self.
   * Arguments passed to or are eagerly evaluated; if you are passing the result of a function call,
   * it is recommended to use or_else, which is lazily evaluated.
   */
  public or<F extends Error>(res: Result<T, F>): Result<T, F> {
    return this.match({
      Ok: () => this as any,
      Err: () => res,
    });
  }

  /**
   * Calls op if the result is Err, otherwise returns the Ok value of self.
   * This function can be used for control flow based on result values.
   */
  public orElse<F extends Error>(op: (err: E) => Result<T, F>): Result<T, F> {
    return this.match({
      Ok: () => this as any,
      Err: () => op(this.#val as E),
    });
  }

  /**
   * Returns the contained Ok value, consuming the self value.
   * Because this function may throw, its use is generally discouraged. Instead, prefer to use pattern matching and handle the Err case explicitly, or call unwrapOr or unwrapOrElse.
   */
  public unwrap(): T {
    return this.match({
      Ok: (val) => val,
      Err: (err) => {
        throw err;
      },
    });
  }

  /**
   * Returns the contained Ok value or a provided default.
   * Arguments passed to unwrap_or are eagerly evaluated; if you are passing the result of a function call,
   * it is recommended to use unwrap_or_else, which is lazily evaluated.
   */
  public unwrapOr(fallback: T): T {
    return this.match({
      Ok: (val) => val,
      Err: () => fallback,
    });
  }

  /**
   * Returns the contained Ok value or computes it from a closure.
   */
  public unwrapOrElse(op: (err: E) => T): T {
    return this.match({
      Ok: (val) => val,
      Err: (err) => op(err),
    });
  }
}

export class Option<T> {
  readonly #val?: T;

  public constructor(val?: T) {
    this.#val = val;
  }

  public isNone(): this is Option<never> {
    return typeof this.#val === "undefined";
  }

  public isSome(): this is Option<T> {
    return !this.isNone();
  }

  /**
   * Emulates Rust's pattern matching syntax.
   */
  public match<O>(pattern: OptionPattern<T, O>): O {
    return this.isSome() ? pattern.Some(this.#val as T) : pattern.None();
  }

  public and<U>(optb: Option<U>): Option<U> {
    return this.match({
      Some: () => optb,
      None: () => this as any,
    });
  }

  public andThen<U>(f: (val: T) => Option<U>): Option<U> {
    return this.match({
      Some: (val) => f(val),
      None: () => this as any,
    });
  }

  public contains(x: T): boolean {
    return this.match({
      Some: (val) => val === x,
      None: () => false,
    });
  }

  public expect(msg: string): T {
    return this.match({
      Some: (val) => val,
      None: () => {
        throw new Error(msg);
      },
    });
  }

  public filter(predicate: (val: T) => boolean): Option<T> {
    return this.match({
      Some: (val) => (predicate(val) ? this : new Option()),
      None: () => this,
    });
  }

  public map<U>(f: (val: T) => U): Option<U> {
    return this.match({
      Some: (val) => new Option(f(val)),
      None: () => this as any,
    });
  }

  public mapOr<U>(fallback: U, f: (val: T) => U): U {
    return this.match({
      Some: (val) => f(val),
      None: () => fallback,
    });
  }

  public mapOrElse<U>(fallback: () => U, f: (val: T) => U): U {
    return this.match({
      Some: (val) => f(val),
      None: () => fallback(),
    });
  }

  public okOr<E extends Error>(err: E): Result<T, E> {
    return this.match({
      Some: (val) => Ok(val) as Result<T, E>,
      None: () => Err(err),
    });
  }

  public okOrElse<E extends Error>(f: () => E): Result<T, E> {
    return this.match({
      Some: (val) => Ok(val) as Result<T, E>,
      None: () => Err(f()),
    });
  }

  public or(optb: Option<T>): Option<T> {
    return this.match({
      Some: () => this,
      None: () => optb,
    });
  }

  public orElse(f: () => Option<T>): Option<T> {
    return this.match({
      Some: () => this,
      None: () => f(),
    });
  }

  public unwrap(): T {
    return this.match({
      Some: (val) => val,
      None: () => {
        throw new Error("called `Option.unwrap()` on a `None` value");
      },
    });
  }

  public unwrapOr(fallback: T): T {
    return this.match({
      Some: (val) => val,
      None: () => fallback,
    });
  }

  public unwrapOrElse(f: () => T): T {
    return this.match({
      Some: (val) => val,
      None: () => f(),
    });
  }
}
