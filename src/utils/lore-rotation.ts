import type { LoreItem } from "../data/baseball-lore-expanded";

/** A deterministic PRNG so rotation behavior can be tested without Math.random(). */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function verifiedLoreItems(items: LoreItem[]): LoreItem[] {
  return items.filter((item) => item.verificationStatus === "verified");
}

/**
 * Returns one complete shuffled pool. The first item is moved when needed so a
 * reshuffle cannot immediately repeat the final item of the prior pool.
 */
export function createLoreSequence(items: LoreItem[], seed: number, avoidId?: string): LoreItem[] {
  const pool = verifiedLoreItems(items);
  const random = mulberry32(seed);
  const sequence = [...pool];
  for (let index = sequence.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [sequence[index], sequence[swapIndex]] = [sequence[swapIndex], sequence[index]];
  }
  if (sequence.length > 1 && avoidId && sequence[0].id === avoidId) {
    [sequence[0], sequence[1]] = [sequence[1], sequence[0]];
  }
  return sequence;
}

export function lorePage(sequence: LoreItem[], offset: number, pageSize = 3): LoreItem[] {
  if (sequence.length === 0) return [];
  return sequence.slice(offset, offset + pageSize);
}
