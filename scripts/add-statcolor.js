import { BASEBALL_LORE_ITEMS } from './src/data/baseball-lore-expanded';

// Add statColor to each lore item based on tag
const colorMap = {
  'PHYSICS BASEBALL': 'bg-red-500/90 border-red-400 text-red-100',
  'WILD HISTORY': 'bg-purple-500/90 border-purple-400 text-purple-100',
  'HISTORIC POWER': 'bg-orange-500/90 border-orange-400 text-orange-100',
  'UNBELIEVABLE': 'bg-pink-500/90 border-pink-400 text-pink-100',
  'FUN HABITS': 'bg-green-500/90 border-green-400 text-green-100',
  'FAMOUS FIRSTS': 'bg-blue-500/90 border-blue-400 text-blue-100',
  'FAMOUS LASTS': 'bg-indigo-500/90 border-indigo-400 text-indigo-100',
  'HALL OF FAME LEGEND': 'bg-amber-500/90 border-amber-400 text-amber-100',
};

// Add statColor to each item
BASEBALL_LORE_ITEMS.forEach(item => {
  if (!item.statColor && colorMap[item.tag]) {
    item.statColor = colorMap[item.tag];
  } else if (!item.statColor) {
    // Default for unknown tags
    item.statColor = 'bg-purple-500/90 border-purple-400 text-purple-100';
  }
});

console.log('Added statColor to all lore items!');
console.log('Total items:', BASEBALL_LORE_ITEMS.length);

// Export updated array for manual verification
export { BASEBALL_LORE_ITEMS };
