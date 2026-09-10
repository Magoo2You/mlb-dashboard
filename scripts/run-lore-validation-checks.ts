import { BASEBALL_LORE_ITEMS, LoreItem } from "../src/data/baseball-lore-expanded";
import { HISTORICAL_PLAYER_PROFILES } from "../src/data/historical-player-profiles";
import { createLoreSequence, lorePage } from "../src/utils/lore-rotation";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const REQUIRED_STRING_FIELDS = ["id", "title", "tag", "statBadge", "fact", "whimsy", "source", "provenance"] as const;
const VALID_STATUSES = new Set(["reviewed-unverified", "verified"]);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Lore validation failed: ${message}`);
}

const ids = new Set<string>();
const counts = { verified: 0, unverified: 0 };
const CONTRADICTED_KNOWN_IDS = new Set(["hof-pedro"]);

for (const [index, item] of BASEBALL_LORE_ITEMS.entries()) {
  const candidate = item as unknown as Record<string, unknown>;
  for (const field of REQUIRED_STRING_FIELDS) {
    assert(typeof candidate[field] === "string" && candidate[field].trim().length > 0, `entry ${index} is missing ${field}`);
  }
  assert(!ids.has(item.id), `duplicate id ${item.id}`);
  ids.add(item.id);
  assert(/^https:\/\/[^\s]+$/.test(item.source), `entry ${item.id} has an invalid source URL`);
  let hasValidUrl = false;
  try { new URL(item.source); hasValidUrl = true; } catch { /* deterministic validation below reports the entry */ }
  assert(hasValidUrl, `entry ${item.id} has an unparsable source URL`);
  assert(VALID_STATUSES.has(item.verificationStatus), `entry ${item.id} has an invalid verification status`);
  if (item.verificationStatus === "verified") {
    assert(item.source.trim().length > 0 && item.provenance.trim().length > 0, `verified entry ${item.id} requires source and provenance`);
    assert(!CONTRADICTED_KNOWN_IDS.has(item.id), `known-contradicted entry ${item.id} cannot be verified`);
  }
  counts[item.verificationStatus === "verified" ? "verified" : "unverified"] += 1;
}

const verifiedItems = BASEBALL_LORE_ITEMS.filter((item) => item.verificationStatus === "verified");
const EXPECTED_NEW_VERIFIED_IDS = [
  "record-dimaggio-56-game-streak",
  "game-mlb-1919-51-minute-nine-innings",
  "game-al-1984-baines-25-inning-walkoff",
  "postseason-2022-world-series-combined-nohitter",
  "all-star-2023-same-surname-homers",
  "record-ohtani-first-50-50-season",
  "record-ohtani-first-3hr-2sb-game",
  "record-ohtani-fastest-40-40-126-games"
];
for (const id of EXPECTED_NEW_VERIFIED_IDS) {
  assert(verifiedItems.some((item) => item.id === id), `new production lore item ${id} is missing`);
}
const sequenceA = createLoreSequence(BASEBALL_LORE_ITEMS, 20260909);
const sequenceB = createLoreSequence(BASEBALL_LORE_ITEMS, 20260909);
assert(sequenceA.map((item) => item.id).join(",") === sequenceB.map((item) => item.id).join(","), "seeded lore rotation is not stable");
assert(new Set(sequenceA.map((item) => item.id)).size === verifiedItems.length, "rotation does not cover the verified pool exactly once");
if (sequenceA.length > 1) {
  const next = createLoreSequence(BASEBALL_LORE_ITEMS, 20260910, sequenceA.at(-1)?.id);
  assert(next[0].id !== sequenceA.at(-1)?.id, "reshuffle repeats the prior boundary item");
}
assert(lorePage([], 0).length === 0, "empty lore pool should render no entries");
assert(lorePage(sequenceA, 0, 3).length === Math.min(3, sequenceA.length), "lore page size is not deterministic");

assert(HISTORICAL_PLAYER_PROFILES.every((profile) => profile.verificationStatus === "verified"), "unverified historical player profile cannot be presented");
for (const profile of HISTORICAL_PLAYER_PROFILES) {
  assert(profile.id.trim() && profile.name.trim() && profile.biography.trim(), `player profile ${profile.id} is incomplete`);
  assert(profile.sourceUrls.length > 0, `player profile ${profile.id} requires source URLs`);
  if (profile.image) assert(profile.image.url.startsWith("https://") && profile.image.rights.trim() && profile.image.provenance.trim(), `player profile ${profile.id} has incomplete image provenance`);
}

for (const item of BASEBALL_LORE_ITEMS) {
  if (!item.image) continue;
  const image = item.image;
  assert(image.localPath.startsWith("/assets/"), `lore image ${item.id} must use a local public asset path`);
  assert(existsSync(resolve(process.cwd(), "public", image.localPath.slice(1))), `lore image ${item.id} asset is missing`);
  for (const field of ["creator", "collection", "sourceRecordUrl", "license", "rightsAdvisory", "attribution", "retrievedAt"] as const) {
    assert(image[field].trim().length > 0, `lore image ${item.id} is missing ${field}`);
  }
  assert(image.sourceRecordUrl.startsWith("https://"), `lore image ${item.id} source record must be HTTPS`);
  assert(image.verificationStatus === "verified", `lore image ${item.id} is not verified`);
}

console.log(`Lore validation passed: ${BASEBALL_LORE_ITEMS.length} active entries; ${counts.verified} verified; ${counts.unverified} reviewed-unverified; ${ids.size} unique IDs.`);
