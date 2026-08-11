/**
 * 🔄 HYBRID LORE SYSTEM
 * 
 * Architecture:
 * - BASEBALL_LORE_ITEMS: Hardcoded iconic moments (always present)
 * - loreFetch(): Optional async function to fetch additional lore from API
 * - loreCache: Stores fetched items in localStorage/sessionStorage
 * 
 * Usage in PassiveCardSchedule.tsx:
 * const [dynamicLore, setDynamicLore] = useState<any[]>([]);
 * 
 * useEffect(() => {
 *   if (enableDynamicLore) {
 *     fetchMoreLore().then(setDynamicLore).catch(console.error);
 *   }
 * }, []);
 */

/**
 * LORE API ENDPOINTS:
 * - Baseball-Reference: https://www.baseball-reference.com/api/
 * - MLB StatsAPI: https://statsapi.mlb.com/api/v1/
 * 
 * Libraries available in package.json:
 * - pybaseball (Python scraper for historical data)
 * - fetch: Built-in browser/node.js API calls
 */

/**
 * LORE CATEGORIES FOR API FETCHING:
 * - "legendary-moments" - Historic games, walk-off HRs, no-hitters
 * - "physics-defying" - Unusual circumstances (Bunsen Burner, etc.)  
 * - "career-highlights" - Hall of Fame players' defining moments
 * - "oddities" - Rare/unusual events in baseball history
 */

/**
 * EXAMPLE LORE ITEM FROM API (hardcoded for reference):
 * {
 *   id: `dynamic_${index}`,
 *   title: "...",
 *   tag: "...",
 *   statBadge: "...",
 *   statColor: "...",
 *   fact: "...",
 *   whimsy: "..."
 * }
 */
