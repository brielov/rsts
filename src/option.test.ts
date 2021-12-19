import { None, Option, Some } from "./option";

describe("Option", () => {
  describe(".and()", () => {
    it("returns None if the option is None", () => {
      expect(None().and(Some(1))).toBeInstanceOf(Option);
    });

    it("returns optb if the option is Some", () => {
      const opt = Some(1).and(Some(2));
      expect(opt).toBeInstanceOf(Option);
      expect(opt.unwrap()).toEqual(2);
    });
  });

  describe(".andThen()", () => {
    it("returns None if the option is None", () => {
      const f = jest.fn();
      const opt = None().andThen(() => Some(1));
      expect(opt).toBeInstanceOf(Option);
      expect(f).not.toHaveBeenCalled();
    });

    it("calls `f` if the option is Some", () => {
      const f = jest.fn(() => Some(2));
      const opt = Some(1).andThen(f);
      expect(f).toHaveBeenCalledTimes(1);
      expect(opt).toBeInstanceOf(Option);
    });
  });

  describe(".contains()", () => {
    it("returns false when option is None", () => {
      expect((None() as Option<string>).contains("abc")).toEqual(false);
    });

    it("returns false when option is Some but values don't match", () => {
      expect(Some(1).contains(2)).toEqual(false);
    });

    it("returns true when option is Some and values match", () => {
      expect(Some(1).contains(1)).toEqual(true);
    });
  });

  describe(".expect()", () => {
    it("throws when the option is None", () => {
      expect(() => None().expect("fail")).toThrow("fail");
    });

    it("returns the value when the option is Some", () => {
      expect(Some(1).expect("fail")).toEqual(1);
    });
  });

  describe(".filter()", () => {
    it("returns false when the option is None", () => {
      expect(None().filter(() => true)).toBeInstanceOf(Option);
    });

    it("returns false when the option is true but the predicate returns false", () => {
      expect(Some(1).filter(() => false)).toBeInstanceOf(Option);
    });

    it("returns true when the option is Some and the predicate returns true", () => {
      expect(
        Some(1)
          .filter(() => true)
          .unwrap(),
      ).toEqual(1);
    });
  });

  describe(".isNone()", () => {
    it("returns true when the option is None", () => {
      expect(None().isNone()).toEqual(true);
    });

    it("returns false when the option is Some", () => {
      expect(Some(1).isNone()).toEqual(false);
    });
  });

  describe(".isSome()", () => {
    it("returns true when the option is Some", () => {
      expect(Some(1).isSome()).toEqual(true);
    });

    it("returns false when the option is None", () => {
      expect(None().isSome()).toEqual(false);
    });
  });

  describe(".map()", () => {
    it("calls `f` when the option is Some", () => {
      const f = jest.fn((x) => x * 2);
      const opt = Some(1).map(f);
      expect(f).toHaveBeenCalledTimes(1);
      expect(f).toHaveBeenCalledWith(1);
      expect(opt.unwrap()).toEqual(2);
    });

    it("returns itself when the option is None", () => {
      const f = jest.fn();
      const opt = None();
      expect(opt.map(f)).toEqual(opt);
      expect(f).not.toHaveBeenCalled();
    });
  });

  describe(".mapOr()", () => {
    it("calls `f` if the option is Some, returns defaultVal otherwise", () => {
      const f = jest.fn((x) => x * 2);

      expect(None().mapOr(1, f)).toEqual(1);
      expect(f).not.toHaveBeenCalled();

      expect(Some(1).mapOr(1, f)).toEqual(2);
      expect(f).toHaveBeenCalledTimes(1);
      expect(f).toHaveBeenCalledWith(1);
    });
  });

  describe(".mapOrElse()", () => {
    it("calls `defaultVal` if the option is None, calls `f` otherwise", () => {
      const f1 = jest.fn<number, []>(() => 2);
      const f2 = jest.fn<number, [number]>((x) => x * 3);

      expect(None().mapOrElse(f1, f2)).toEqual(2);
      expect(f1).toHaveBeenCalledTimes(1);
      expect(f2).not.toHaveBeenCalled();

      f1.mockClear();
      f2.mockClear();

      expect(Some(1).mapOrElse(f1, f2)).toEqual(3);
      expect(f1).not.toHaveBeenCalled();
      expect(f2).toHaveBeenCalledTimes(1);
      expect(f2).toHaveBeenCalledWith(1);
    });
  });

  describe(".match()", () => {
    it("calls Some branch when the option is Some", () => {
      const f1 = jest.fn();
      const f2 = jest.fn();

      Some(1).match({ Some: f1, None: f2 });

      expect(f1).toHaveBeenCalledTimes(1);
      expect(f1).toHaveBeenCalledWith(1);
      expect(f2).not.toHaveBeenCalled();
    });

    it("calls None branch when the option is None", () => {
      const f1 = jest.fn();
      const f2 = jest.fn();

      None().match({ Some: f1, None: f2 });

      expect(f2).toHaveBeenCalledTimes(1);
      expect(f1).not.toHaveBeenCalled();
    });
  });

  describe(".okOr()", () => {
    it("returns a Ok Result when the option is Some", () => {
      const res = Some(1).okOr(new Error("fail"));
      expect(res.unwrap()).toEqual(1);
    });

    it("returns a Err Result when the option is None", () => {
      const res = None().okOr(new Error("fail"));
      expect(() => res.unwrap()).toThrow(
        "called `Result.unwrap()` on an `Err` value",
      );
    });
  });

  describe(".okOrElse()", () => {
    it("returns a Ok Result when the option is Some", () => {
      const fn = jest.fn();
      const res = Some(1).okOrElse(fn);
      expect(res.unwrap()).toEqual(1);
      expect(fn).not.toHaveBeenCalled();
    });

    it("calls `err` when the option is None", () => {
      const f = jest.fn(() => new Error("fail"));
      const res = None().okOrElse(f);
      expect(() => res.unwrap()).toThrow(
        "called `Result.unwrap()` on an `Err` value",
      );
      expect(f).toHaveBeenCalledTimes(1);
    });
  });

  describe(".or()", () => {
    it("returns its value when the option is Some", () => {
      expect(Some(1).or(Some(2)).unwrap()).toEqual(1);
    });

    it("returns `optb` when the option is None", () => {
      expect((None() as Option<number>).or(Some(1)).unwrap()).toEqual(1);
    });
  });

  describe(".orElse()", () => {
    it("returns its value when the option is Some", () => {
      const f = jest.fn(() => Some(2));
      expect(Some(1).orElse(f).unwrap()).toEqual(1);
      expect(f).not.toHaveBeenCalled();
    });

    it("calls `f` when the option is None", () => {
      const f = jest.fn(() => Some(2));
      expect((None() as Option<number>).orElse(f).unwrap()).toEqual(2);
      expect(f).toHaveBeenCalledTimes(1);
    });
  });

  describe(".unwrap()", () => {
    it("returns its value when the option is Some", () => {
      expect(Some(1).unwrap()).toEqual(1);
    });

    it("throws when the option is None", () => {
      expect(() => None().unwrap()).toThrow(
        "called `Option.unwrap()` on a `None` value",
      );
    });
  });

  describe(".unwrapOr()", () => {
    it("returns its value when the option is Some", () => {
      expect(Some(1).unwrapOr(2)).toEqual(1);
    });

    it("returns `defaultVal` when the option is None", () => {
      expect((None() as Option<number>).unwrapOr(2)).toEqual(2);
    });
  });

  describe(".unwrapOrElse()", () => {
    const f = jest.fn(() => 2);

    it("returns its value when the option is Some", () => {
      expect(Some(1).unwrapOrElse(f)).toEqual(1);
      expect(f).not.toHaveBeenCalled();
    });

    it("calls `f` when the option is None", () => {
      expect((None() as Option<number>).unwrapOrElse(f)).toEqual(2);
      expect(f).toHaveBeenCalledTimes(1);
    });
  });
});
