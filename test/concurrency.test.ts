import { describe, expect, it } from "vitest";
import {
  mapWithConcurrency,
  parseConcurrency,
} from "../src/lib/concurrency.js";

describe("concurrency helpers", () => {
  it("maps in input order while respecting concurrency", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const values = [1, 2, 3, 4, 5, 6];

    const mapped = await mapWithConcurrency(values, 2, async (value) => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      try {
        await new Promise((resolve) => setTimeout(resolve, 5 * (value % 3)));
        return value * 10;
      } finally {
        inFlight -= 1;
      }
    });

    expect(mapped).toEqual([10, 20, 30, 40, 50, 60]);
    expect(maxInFlight).toBeLessThanOrEqual(2);
  });

  it("parses/clamps concurrency values safely", () => {
    expect(parseConcurrency(undefined, 4, { min: 1, max: 8 })).toBe(4);
    expect(parseConcurrency("3", 4, { min: 1, max: 8 })).toBe(3);
    expect(parseConcurrency("0", 4, { min: 1, max: 8 })).toBe(1);
    expect(parseConcurrency("200", 4, { min: 1, max: 8 })).toBe(8);
    expect(parseConcurrency("not-a-number", 6, { min: 1, max: 8 })).toBe(6);
  });
});
