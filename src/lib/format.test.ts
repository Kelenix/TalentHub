import { describe, it, expect } from "vitest";
import { attr, formatDate } from "./format";

describe("attr", () => {
  it("lit une valeur string dans le JSON attributes", () => {
    expect(attr({ preparationTime: "2 heures" }, "preparationTime")).toBe(
      "2 heures",
    );
  });

  it("renvoie undefined si clé absente, attributes nul ou valeur nulle", () => {
    expect(attr(null, "x")).toBeUndefined();
    expect(attr({}, "x")).toBeUndefined();
    expect(attr({ x: null }, "x")).toBeUndefined();
  });

  it("convertit les valeurs non-string en string", () => {
    expect(attr({ n: 4 }, "n")).toBe("4");
  });
});

describe("formatDate", () => {
  it("formate une date avec l'année", () => {
    const d = new Date("2026-06-18T12:00:00Z");
    expect(formatDate(d, "fr")).toContain("2026");
    expect(formatDate(d, "it")).toContain("2026");
  });
});
