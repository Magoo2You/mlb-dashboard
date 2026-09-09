import { BASEBALL_LORE_ITEMS, LoreItem } from "../src/data/baseball-lore-expanded";

const REQUIRED_STRING_FIELDS = ["id", "title", "tag", "statBadge", "fact", "whimsy", "source", "provenance"] as const;
const VALID_STATUSES = new Set(["reviewed-unverified", "verified"]);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Lore validation failed: ${message}`);
}

const ids = new Set<string>();
const counts = { verified: 0, unverified: 0 };

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
  counts[item.verificationStatus === "verified" ? "verified" : "unverified"] += 1;
}

console.log(`Lore validation passed: ${BASEBALL_LORE_ITEMS.length} active entries; ${counts.verified} verified; ${counts.unverified} reviewed-unverified; ${ids.size} unique IDs.`);
