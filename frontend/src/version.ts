// Section.Feature.Fix, shown as it is (2026-11-28: the same versions as SirisOS; see docs/releases.md). Releases up
// to 1.22 were named X.YY, which is 1.2.2 here.
export function formatVersion(semver: string): string {
  return semver;
}

export const APP_VERSION =
  typeof __APP_VERSION__ === "string" ? formatVersion(__APP_VERSION__) : "dev";
