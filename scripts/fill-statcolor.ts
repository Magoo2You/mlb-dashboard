import { BASEBALL_LORE_ITEMS } from './src/data/baseball-lore-expanded';

// Add default statColor to all items that don't have it
BASEBALL_LORE_ITEMS.forEach(item => {
  if (!item.statColor) {
    item.statColor = 'bg-purple-500/90 border-purple-400 text-purple-100';
  }
});

export const BASEBALL_LORE_ITEMS_UPDATED = BASEBALL_LORE_ITEMS;
