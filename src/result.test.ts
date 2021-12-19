import { Err, Ok, Result } from "./result";

const error = new Error("fail");

describe("Result", () => {
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
});
