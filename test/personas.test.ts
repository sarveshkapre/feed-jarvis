import { describe, expect, it } from "vitest";
import {
  DEFAULT_PERSONAS,
  getPersona,
  mergePersonas,
  parsePersonasJson,
} from "../src/lib/personas.js";

describe("personas", () => {
  it("parses personas json and merges overrides deterministically", () => {
    const fromFile = parsePersonasJson(
      JSON.stringify([
        { name: "Analyst", prefix: "Deep dive:" },
        { name: "Founder", prefix: "Founder note:" },
      ]),
    );

    const merged = mergePersonas(DEFAULT_PERSONAS, fromFile);
    expect(merged.map((p) => p.name)).toEqual([
      "Analyst",
      "Builder",
      "Founder",
    ]);

    const analyst = getPersona("analyst", merged);
    expect(analyst.prefix).toBe("Deep dive:");

    const founder = getPersona("Founder", merged);
    expect(founder.prefix).toBe("Founder note:");
  });

  it("rejects invalid personas json", () => {
    expect(() => parsePersonasJson('{"name":"x"}')).toThrow();
    expect(() => parsePersonasJson('[{"name":"","prefix":"x"}]')).toThrow();
  });
});
