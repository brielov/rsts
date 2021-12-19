import { None, type Option, Some } from "./option";
import { identity } from "./util";

interface Pattern<T, E, O> {
  Ok(v: T): O;
  Err(e: E): O;
}

export class Result<T, E extends Error = Error> {
  public constructor(
    private readonly _ok: boolean,
    private readonly val: T | E,
  ) {}

  public isOk(): boolean {
    return this._ok;
  }

  public isErr(): boolean {
    return !this.isOk();
  }

  public match<O>(pattern: Pattern<T, E, O>): O {
    const { val } = this;
    return this.isOk() ? pattern.Ok(val as T) : pattern.Err(val as E);
  }

  public contains(x: T): boolean {
    return this.match({ Ok: (v) => v === x, Err: () => false });
  }

  public containsErr(f: string): boolean {
    return this.match({ Ok: () => false, Err: (e) => e.message === f });
  }

  public ok(): Option<T> {
    return this.match({ Ok: (v) => Some(v), Err: () => None() });
  }

  public err(): Option<E> {
    return this.match({ Ok: () => None(), Err: (e) => Some(e) });
  }

  public map<U>(f: (v: T) => U): Result<U, E> {
    return this.match({
      Ok: (v) => new Result(true, f(v)),
      Err: () => this as any,
    });
  }

  public mapOr<U>(def: U, f: (v: T) => U): U {
    return this.match({ Ok: f, Err: () => def });
  }

  public mapOrElse<U>(def: (e: E) => U, f: (v: T) => U): U {
    return this.match({ Ok: f, Err: def });
  }

  public mapErr<F extends Error>(op: (e: E) => F): Result<T, F> {
    return this.match({
      Ok: () => this as any,
      Err: (e) => new Result(false, op(e)),
    });
  }

  public and<U>(res: Result<U, E>): Result<U, E> {
    return this.match({ Ok: () => res, Err: () => this as any });
  }

  public andThen<U>(f: (v: T) => Result<U, E>): Result<U, E> {
    return this.match({ Ok: f, Err: () => this as any });
  }

  public or<F extends Error>(res: Result<T, F>): Result<T, F> {
    return this.match({ Ok: () => this as any, Err: () => res });
  }

  public orElse<F extends Error>(op: (e: E) => Result<T, F>): Result<T, F> {
    return this.match({ Ok: () => this as any, Err: op });
  }

  public unwrapOr(def: T): T {
    return this.match({ Ok: identity, Err: () => def });
  }

  public unwrapOrElse(op: (e: E) => T): T {
    return this.match({ Ok: identity, Err: op });
  }

  public expect(msg: string): T {
    return this.match({
      Ok: identity,
      Err: () => {
        throw new Error(msg);
      },
    });
  }

  public unwrap(): T {
    return this.match({
      Ok: identity,
      Err: () => {
        throw new Error("called `Result.unwrap()` on an `Err` value");
      },
    });
  }

  public expectErr(msg: string): E {
    return this.match({
      Ok: () => {
        throw new Error(msg);
      },
      Err: identity,
    });
  }

  public unwrapErr(): E {
    return this.match({
      Ok: () => {
        throw new Error("called `Result.unwrapErr()` on an `Ok` value");
      },
      Err: identity,
    });
  }

  public flatten(): Result<T, E> {
    return this.andThen((v) => (v instanceof Result ? v : this));
  }
}

export const Ok = <T, E extends Error = Error>(val: T): Result<T, E> =>
  new Result<T, E>(true, val);

export const Err = <E extends Error, T = never>(err: E): Result<T, E> =>
  new Result<T, E>(false, err);
