import { describe, it, expect } from "vitest";
import { whatsappLink, mailtoLink } from "./contact";

describe("whatsappLink", () => {
  it("retire les caractères non numériques et construit l'URL wa.me", () => {
    expect(whatsappLink("+39 351 000 0001")).toBe("https://wa.me/393510000001");
  });

  it("encode le texte pré-rempli", () => {
    expect(whatsappLink("0102", "Bonjour à toi")).toBe(
      "https://wa.me/0102?text=Bonjour%20%C3%A0%20toi",
    );
  });
});

describe("mailtoLink", () => {
  it("construit un mailto avec sujet encodé", () => {
    expect(mailtoLink("a@b.com", "Sujet & co")).toBe(
      "mailto:a@b.com?subject=Sujet%20%26%20co",
    );
  });

  it("fonctionne sans sujet", () => {
    expect(mailtoLink("a@b.com")).toBe("mailto:a@b.com");
  });
});
