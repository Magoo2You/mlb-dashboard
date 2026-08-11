/**
 * LORE ACCUMULATOR - Simple Prototype
 * 
 * Fetches lore from external sources and appends to hardcoded dataset.
 * Designed for offline accumulation (grows your data set to 10,000 entries).
 */

import { BASEBALL_LORE_ITEMS } from '../data/baseball-lore-expanded';

/**
 * Sample fetched lore entry - structure matches your existing format
 * You would replace this with actual API calls later
 */
const SAMPLE_FAMOUS_FIRSTS: Array<{
  id: string;
  title: string;
  tag: string;
  category: string;
  fact: string;
  whimsy: string;
}> = [
  {
    id: 'ff-001',
    title: 'First Home Run in World Series',
    tag: 'FAMOUS FIRST',
    category: 'Famous Firsts',
    fact: 'Harry Pulliam hit the first home run in World Series history on May 15, 1926 for the Chicago Cubs against the Philadelphia Phillies.',
    whimsy: 'This milestone marked the beginning of power hitting as a celebrated achievement in baseball playoffs, changing how teams approached slugger positioning.'
  },
  {
    id: 'ff-002',
    title: 'First No-Hitter by Left-Handed Pitcher',
    tag: 'FAMOUS FIRST',
    category: 'Famous Firsts',
    fact: 'Left-handed pitcher first recorded throwing a no-hitter in major league play, demonstrating rare combination of spin and velocity.',
    whimsy: 'Proved lefties could dominate batters the same way right-handers did, opening door for more balanced pitching rotations.'
  },
  {
    id: 'ff-003',
    title: 'First Walk-Off Grand Slam in September',
    tag: 'FAMOUS FIRST',
    category: 'Famous Firsts',
    fact: 'First walk-off grand slam hit in a September game, combining power hitting with clutch performance at perfect moment.',
    whimsy: 'Established template for championship-caliber closing performances that teams still train pitchers and batters to execute.'
  }
];

/**
 * Get total lore entries after merging
 */
export function getEntryCount(): number {
  return BASEBALL_LORE_ITEMS.length + SAMPLE_FAMOUS_FIRSTS.length;
}

/**
 * Merge fetched items into hardcoded dataset
 */
export function mergeFetchedLore(fetched: Array<{
  id: string;
  title: string;
  tag: string;
  category: string;
  fact: string;
  whimsy: string;
}>): void {
  // Append fetched items to your existing lore collection
  BASEBALL_LORE_ITEMS.push(...fetched);
  
  console.log(`✅ Merged ${fetched.length} entries into dataset`);
  console.log(`   Total lore entries now: ${BASEBALL_LORE_ITEMS.length}`);
}

/**
 * Prototype test - shows what fetched data would look like
 */
export function runPrototypeTest(): void {
  console.log('\n=== LORE ACCUMULATOR PROTOTYPE ===\n');
  
  console.log('📥 Simulating fetch from external source...');
  console.log('   (Would normally call Baseball Almanac API)\n');
  
  console.log('✅ Retrieved sample Famous Firsts entries:\n');
  
  for (const entry of SAMPLE_FAMOUS_FIRSTS) {
    console.log(`[${entry.category}] ${entry.title}`);
    console.log(`   Fact: ${entry.fact}`);
    console.log(`   Whimsy: ${entry.whimsy}`);
    console.log('---');
  }
  
  console.log('\n📊 Dataset Status:');
  console.log(`   Current hardcoded entries: ${BASEBALL_LORE_ITEMS.length}`);
  console.log(`   Fetched entries (sample): ${SAMPLE_FAMOUS_FIRSTS.length}`);
  console.log(`   Total after merge: ${getEntryCount()}`);
  
  console.log('\n🎯 Goal: Grow to 10,000 total lore entries');
  console.log('   Current progress:', Math.round(100 * BASEBALL_LORE_ITEMS.length / 10000), '%');
  
  console.log('\n💡 To accumulate more:');
  console.log('   1. Fetch from Baseball Almanac (Famous Firsts, Wild History, Famous Lasts)');
  console.log('   2. Parse HTML and extract fact + whimsy for each entry');
  console.log('   3. Append to BASEBALL_LORE_ITEMS array in baseball-lore-expanded.ts');
  console.log('   4. Repeat until dataset reaches target size\n');
}
