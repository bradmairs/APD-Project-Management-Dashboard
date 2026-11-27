import { describe, expect, it } from "vitest";
import { formatVersion } from "./version";

describe("formatVersion", () => {
  it("shows Section.Feature.Fix as it is", () => {
    expect(formatVersion("1.2.3")).toBe("1.2.3");
    expect(formatVersion("dev")).toBe("dev");
  });
});
