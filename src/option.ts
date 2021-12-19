import { Err, Ok, type Result } from "./result";
import { identity } from "./util";

interface Pattern<T, O> {
  Some(v: T): O;
  None(): O;
}

export class Option<T> {
  public constructor(private readonly val?: T | null) {}

  public isSome(): boolean {
    return typeof this.val !== "undefined" && this.val !== null;
  }

  public isNone(): boolean {
    return !this.isSome();
  }

  public match<O>(pattern: Pattern<T, O>): O {
    return this.isSome() ? pattern.Some(this.val as T) : pattern.None();
  }

  public contains(x: T): boolean {
    return this.match({ Some: (v) => v === x, None: () => false });
  }

  public expect(msg: string): T {
    return this.match({
      Some: identity,
      None: () => {
        throw new Error(msg);
      },
    });
  }

  public unwrap(): T {
    return this.match({
      Some: identity,
      None: () => {
        throw new Error("called `Option.unwrap()` on a `None` value");
      },
    });
  }

  public unwrapOr(def: T): T {
    return this.match({ Some: identity, None: () => def });
  }

  public unwrapOrElse(f: () => T): T {
    return this.match({ Some: identity, None: f });
  }

  public map<U>(f: (v: T) => U): Option<U> {
    return this.match({
      Some: (v) => new Option(f(v)),
      None: () => this as any,
    });
  }

  public mapOr<U>(def: U, f: (v: T) => U): U {
    return this.match({ Some: f, None: () => def });
  }

  public mapOrElse<U>(def: () => U, f: (v: T) => U): U {
    return this.match({ Some: f, None: def });
  }

  public okOr<E extends Error>(err: E): Result<T, E> {
    return this.match({
      Some: (v) => Ok(v),
      None: () => Err(err) as any,
    });
  }

  public okOrElse<E extends Error>(err: () => E): Result<T, E> {
    return this.match({ Some: (v) => Ok(v), None: () => Err(err()) as any });
  }

  public and<U>(optb: Option<U>): Option<U> {
    return this.match({ Some: () => optb, None: () => this as any });
  }

  public andThen<U>(f: (v: T) => Option<U>): Option<U> {
    return this.match({ Some: f, None: () => this as any });
  }

  public filter(predicate: (v: T) => boolean): this {
    return this.match({
      Some: (v) => (predicate(v) ? this : new Option()),
      None: () => this as any,
    });
  }

  public or(optb: Option<T>): Option<T> {
    return this.match({ Some: () => this, None: () => optb });
  }

  public orElse(f: () => Option<T>): Option<T> {
    return this.match({ Some: () => this, None: f });
  }

  public flatten(): Option<T> {
    return this.andThen((v) => (v instanceof Option ? v : this));
  }
}

export const Some = <T>(val: T): Option<T> => new Option(val);
export const None = (): Option<never> => new Option();
