import { Err, Ok, Result } from "./result";

const error = new Error("fail");

describe("Result", () => {
  describe(".isOk()", () => {
    it("returns true when the Result is Ok", () => {
      expect(Ok(1).isOk()).toEqual(true);
    });

    it("returns false when the Result is Err", () => {
      expect(Err(error).isOk()).toEqual(false);
    });
  });

  describe(".isErr()", () => {
    it("returns false when the Result is Ok", () => {
      expect(Ok(1).isErr()).toEqual(false);
    });

    it("returns true when the Result is Err", () => {
      expect(Err(error).isErr()).toEqual(true);
    });
  });

  describe(".and()", () => {
    it("returns `res` when the Result is OK", () => {
      expect(Ok(1).and(Ok(2)).unwrap()).toEqual(2);
    });

    it("returns itself when the Result is Err", () => {
      const res = Err(error);
      expect(res).toBeInstanceOf(Result);
      expect(res.and(Ok(1))).toEqual(res);
    });
  });

  describe(".andThen()", () => {
    it("calls `op` when the Result is Ok", () => {
      const f = jest.fn(() => Ok(2));
      expect(Ok(1).andThen(f).unwrap()).toEqual(2);
      expect(f).toHaveBeenCalledTimes(1);
      expect(f).toHaveBeenCalledWith(1);
    });

    it("returns itself when the Result is Err", () => {
      const f = jest.fn(() => Ok(2));
      const res = Err(error);
      expect(res.andThen(f)).toEqual(res);
      expect(f).not.toHaveBeenCalled();
    });
  });

  describe(".contains()", () => {
    it("returns false when the Result is Err", () => {
      expect((Err(error) as Result<string>).contains("abc")).toEqual(false);
    });

    it("returns false when the Result is Ok but the predicate returns false", () => {
      expect(Ok(1).contains(2)).toEqual(false);
    });

    it("returns true when the Result is Ok and the predicate returns true", () => {
      expect(Ok(1).contains(1)).toEqual(true);
    });
  });

  describe(".containsErr()", () => {
    it("returns false when the Result is Ok", () => {
      expect(Ok(1).containsErr("some error")).toEqual(false);
    });

    it("returns false when the Result is Err but the predicate returns false", () => {
      expect(Err(new Error("some error")).containsErr("hello")).toEqual(false);
    });

    it("returns true when the Result is Err and the predicate returns true", () => {
      expect(Err(new Error("some error")).containsErr("some error")).toEqual(
        true,
      );
    });
  });

  describe(".ok()", () => {
    it("returns Some when the Result is an Ok", () => {
      const opt = Ok(1).ok();
      expect(opt.isSome()).toEqual(true);
      expect(opt.unwrap()).toEqual(1);
    });

    it("returns None when the Result is an Err", () => {
      const opt = (Err(error) as Result<string>).ok();
      expect(opt.isNone()).toEqual(true);
    });
  });

  describe(".err()", () => {
    it("returns Some when the Result is an Err", () => {
      const opt = Err(error).err();
      expect(opt.isSome()).toEqual(true);
      expect(opt.unwrap()).toEqual(error);
    });

    it("returns None when the Result is an Ok", () => {
      const opt = Ok(1).err();
      expect(opt.isNone()).toEqual(true);
    });
  });

  describe(".expect()", () => {
    it("unwraps the value when the Result is Ok", () => {
      expect(Ok(1).expect("err")).toEqual(1);
    });

    it("throws an error when the Result is Err", () => {
      const result = Err(error) as Result<number>;
      expect(() => result.expect("some error")).toThrow("some error");
    });
  });

  describe(".expectErr()", () => {
    it("unwraps the error when the Result is Err", () => {
      expect(Err(error).expectErr("some error")).toEqual(error);
    });

    it("throws an error when the Result is Ok", () => {
      expect(() => Ok(1).expectErr("expecting error")).toThrow(
        "expecting error",
      );
    });
  });

  describe(".map()", () => {
    it("calls `f` when the Result is Ok", () => {
      const f = jest.fn((x) => x * 2);
      const result = Ok(1).map(f);
      expect(f).toHaveBeenCalledTimes(1);
      expect(f).toHaveBeenCalledWith(1);
      expect(result.unwrap()).toEqual(2);
    });

    it("returns itself when the Result is Err", () => {
      const f = jest.fn();
      const result = Err(error);
      expect(result.map(f)).toBe(result);
      expect(f).not.toHaveBeenCalled();
    });
  });

  describe(".mapErr()", () => {
    it("calls `f` when the Result is Err", () => {
      const f = jest.fn((e) => new Error(`${e.message} again`));
      const result = Err(error).mapErr(f);
      expect(f).toHaveBeenCalledTimes(1);
      expect(f).toHaveBeenCalledWith(error);
      expect(result.unwrapErr().message).toEqual("fail again");
    });

    it("returns itself when the Result is Ok", () => {
      const result = Ok(1);
      expect(result.mapErr(() => error)).toBe(result);
    });
  });

  describe(".mapOr()", () => {
    it("calls `f` if the Result is Ok, returns `def` otherwise", () => {
      const f = jest.fn((x) => x * 2);

      expect((Err(error) as Result<number>).mapOr(1, f)).toEqual(1);
      expect(f).not.toHaveBeenCalled();

      expect(Ok(1).mapOr(1, f)).toEqual(2);
      expect(f).toHaveBeenCalledTimes(1);
      expect(f).toHaveBeenCalledWith(1);
    });
  });

  describe(".mapOrElse()", () => {
    it("calls `def` if the Result is Ok, calls `f` otherwise", () => {
      const f1 = jest.fn<number, []>(() => 2);
      const f2 = jest.fn<number, [number]>((x) => x * 3);

      expect(Err(error).mapOrElse(f1, f2)).toEqual(2);
      expect(f1).toHaveBeenCalledTimes(1);
      expect(f2).not.toHaveBeenCalled();

      f1.mockClear();
      f2.mockClear();

      expect(Ok(1).mapOrElse(f1, f2)).toEqual(3);
      expect(f1).not.toHaveBeenCalled();
      expect(f2).toHaveBeenCalledTimes(1);
      expect(f2).toHaveBeenCalledWith(1);
    });
  });

  describe(".match()", () => {
    it("calls Ok branch when the Result is Ok", () => {
      const f1 = jest.fn();
      const f2 = jest.fn();

      Ok(1).match({ Ok: f1, Err: f2 });

      expect(f1).toHaveBeenCalledTimes(1);
      expect(f1).toHaveBeenCalledWith(1);
      expect(f2).not.toHaveBeenCalled();
    });

    it("calls Err branch when the Result is Err", () => {
      const f1 = jest.fn();
      const f2 = jest.fn();

      Err(error).match({ Ok: f1, Err: f2 });

      expect(f2).toHaveBeenCalledTimes(1);
      expect(f1).not.toHaveBeenCalled();
    });
  });

  describe(".or()", () => {
    it("returns its value when the Result is Ok", () => {
      expect(Ok(1).or(Ok(2)).unwrap()).toEqual(1);
    });

    it("returns `optb` when the Result is Err", () => {
      expect((Err(error) as Result<number>).or(Ok(1)).unwrap()).toEqual(1);
    });
  });

  describe(".orElse()", () => {
    it("returns its value when the Result is Ok", () => {
      const f = jest.fn(() => Ok(2));
      expect(Ok(1).orElse(f).unwrap()).toEqual(1);
      expect(f).not.toHaveBeenCalled();
    });

    it("calls `f` when the Result is Err", () => {
      const f = jest.fn(() => Ok(1));
      expect((Err(error) as Result<number>).orElse(f).unwrap()).toEqual(1);
      expect(f).toHaveBeenCalledTimes(1);
    });
  });

  describe(".unwrap()", () => {
    it("returns its value when the Result is Ok", () => {
      expect(Ok(1).unwrap()).toEqual(1);
    });

    it("throws when the Result is Err", () => {
      expect(() => Err(error).unwrap()).toThrow(
        "called `Result.unwrap()` on an `Err` value",
      );
    });
  });

  describe(".uwnrapErr()", () => {
    it("unwraps the error when the Result is Err", () => {
      expect(Err(error).unwrapErr()).toEqual(error);
    });

    it("throws an error when the Result is Ok", () => {
      expect(() => Ok(1).unwrapErr()).toThrow(
        "called `Result.unwrapErr()` on an `Ok` value",
      );
    });
  });

  describe(".unwrapOr()", () => {
    it("returns its value when the Result is Ok", () => {
      expect(Ok(1).unwrapOr(2)).toEqual(1);
    });

    it("returns `def` when the Result is Err", () => {
      expect((Err(error) as Result<number>).unwrapOr(2)).toEqual(2);
    });
  });

  describe(".unwrapOrElse()", () => {
    const f = jest.fn(() => 2);

    it("returns its value when the Result is Ok", () => {
      expect(Ok(1).unwrapOrElse(f)).toEqual(1);
      expect(f).not.toHaveBeenCalled();
    });

    it("calls `f` when the Result is Err", () => {
      expect((Err(error) as Result<number>).unwrapOrElse(f)).toEqual(2);
      expect(f).toHaveBeenCalledTimes(1);
    });
  });

  describe(".flatten()", () => {
    it("unwraps nested Result when the Result is Ok", () => {
      const result = Ok(Ok(1));
      expect(result.flatten().unwrap()).toEqual(1);
    });

    it("returns itself when the value is not a nested Result", () => {
      const result = Ok(1);
      expect(result.flatten()).toBe(result);
    });
  });
});
