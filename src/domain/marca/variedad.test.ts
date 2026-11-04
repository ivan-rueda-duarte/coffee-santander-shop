import { describe, expect, it } from "vitest";
import { nombreDeVariedad, nombresDeVariedades } from "./variedad";

describe("variedad", () => {
  it("agrega ® a Castillo", () => {
    expect(nombreDeVariedad("Castillo")).toBe("Castillo®");
    expect(nombreDeVariedad(" castillo ")).toBe("Castillo®");
  });
  it("no repite el ® ni toca otras variedades", () => {
    expect(nombreDeVariedad("Castillo®")).toBe("Castillo®");
    expect(nombreDeVariedad("Caturra")).toBe("Caturra");
    expect(nombreDeVariedad("Castillo Naranjal")).toBe("Castillo Naranjal");
  });
  it("une varias", () => {
    expect(nombresDeVariedades(["Caturra", "Castillo"])).toBe("Caturra, Castillo®");
    expect(nombresDeVariedades([])).toBe("");
  });
});
