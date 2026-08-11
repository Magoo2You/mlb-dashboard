/**
 * LORE MONITOR - Cloud-Native Daily Add System
 * 
 * Since you're using Render (no local cron), we'll use:
 * 1. GitHub Actions for auto-fetch (FREE, runs in cloud)
 * 2. Webhook endpoint for manual trigger when needed
 */

import { BASEBALL_LORE_ITEMS } from '../data/baseball-lore-expanded';
import { fetchLoreFromAllCategories } from './lore-accumulator';

/**
 * Check and add new entries to dataset
 * (For webhook endpoint - called externally)
 */
export async function checkAndAddNewEntries(): Promise<{
  addedCount: number;
  totalEntries: number;
  progressTo15K: number;
}> {
  console.log('🔔 Lore check triggered');
  
  // Fetch new lore from all categories
  const fetched = fetchLoreFromAllCategories();
  
  const oldTotal = BASEBALL_LORE_ITEMS.length;
  
  // Append new entries (in production, you'd check for duplicates)
  BASEBALL_LORE_ITEMS.push(...fetched);
  
  const addedCount = BASEBALL_LORE_ITEMS.length - oldTotal;
  
  console.log(`✅ Added ${addedCount} new lore entries`);
  console.log(`   Dataset now contains: ${BASEBALL_LORE_ITEMS.length} total entries`);
  
  const progressTo15K = Math.min(100, Math.round(100 * BASEBALL_LORE_ITEMS.length / 15000));
  
  return {
    addedCount,
    totalEntries: BASEBALL_LORE_ITEMS.length,
    progressTo15K
  };
}

/**
 * Get current dataset stats
 */
export function getDatasetStats(): {
  totalEntries: number;
  progressTo15K: number;
} {
  return {
    totalEntries: BASEBALL_LORE_ITEMS.length,
    progressTo15K: Math.min(100, Math.round(100 * BASEBALL_LORE_ITEMS.length / 15000))
  };
}

/**
 * Setup for webhook endpoint (add to server.ts):
 * 
 * app.post('/api/check-lore', async (req, res) => {
 *   try {
 *     const stats = await checkAndAddNewEntries();
 *     
 *     // Rebuild production bundle
 *     execSync('npm run build');
 *     
 *     return res.json(stats);
 *   } catch (error) {
 *     console.error('Error:', error);
 *     return res.status(500).json({ error: 'Failed to fetch lore' });
 *   }
 * });
 */

// Current stats for monitoring
export const CURRENT_STATS = getDatasetStats();

console.log('\n📊 LORE MONITOR - Cloud-Native Status:');
console.log(`   Total entries: ${CURRENT_STATS.totalEntries}`);
console.log(`   Progress to 15K: ${CURRENT_STATS.progressTo15K}%`);
console.log('✅ Ready for GitHub Actions or webhook!\n');
