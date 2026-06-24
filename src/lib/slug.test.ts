import { describe, it, expect } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("met en minuscules, retire les accents et met des tirets", () => {
    expect(slugify("Couture Africaine")).toBe("couture-africaine");
    expect(slugify("Beauté & Coiffure")).toBe("beaute-coiffure");
    expect(slugify("Soutien   scolaire")).toBe("soutien-scolaire");
  });

  it("retire les tirets en début/fin", () => {
    expect(slugify("--Hello--")).toBe("hello");
    expect(slugify("  Ménage  ")).toBe("menage");
  });
});
