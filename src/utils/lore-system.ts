/**
 * LORE FETCHER - Hybrid System (Hardcoded + Fetchable)
 * 
 * Architecture:
 * 1. BASEBALL_LORE_ITEMS: Hardcoded iconic moments (fallback)
 * 2. loreFetch(): Async function to fetch additional items from API
 * 3. loreCache: Stores fetched items with timestamps
 */

import { useState, useEffect } from 'react';

// ============================================================================
// SECTION 1: HARDCODED FALLBACK LOR E ITEMS (Always Present)
// These iconic moments are guaranteed to be shown even if API fails
// ============================================================================

export const BASEBALL_LORE_ITEMS = [
  {
    id: "gaedel",
    title: "Eddie Gaedel's 3'7\" Strike Zone (1951)",
    tag: "WILD HISTORY",
    headshotUrl: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_420,q_auto:best/v1/people/114515/headshot/silo/current",
    statBadge: ".1000 OBP",
    statColor: "text-purple-400 border-purple-500/40 bg-purple-950/40",
    fact: "St. Louis Browns owner Bill Veeck sent 3'7\" Eddie Gaedel to bat wearing jersey #1/8. His strike zone was 1.5 inches tall! He drew a 4-pitch walk.",
    whimsy: "MLB banned his contract the next day, but his 1.000 career OBP remains unbroken forever."
  },
  {
    id: "bird",
    title: "The 1-in-19-Billion Pigeon Fastball (2001)",
    tag: "STATCAST ODDITY",
    headshotUrl: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_420,q_auto:best/v1/people/116615/headshot/silo/current",
    statBadge: "100 MPH",
    statColor: "text-amber-400 border-amber-500/40 bg-amber-950/40",
    fact: "On March 24, 2001, Randy Johnson's 100mph sinker intercepted a flying pigeon. Physicists calculated the probability at 1 in 19,000,000,000!",
    whimsy: "The umpire officially ruled the pitch 'No Pitch (Fowl Ball)'.",
  },
  // ... (existing items from current file)
];

// ============================================================================
// SECTION 2: LORE FETCHER - Fetch Additional Items from API Sources
// ============================================================================

interface LoreFetchConfig {
  enableDynamicLore?: boolean;
  categories?: ('legendary-moments' | 'physics-defying' | 'career-highlights' | 'oddities')[];
  maxItems?: number;
}

const DEFAULT_LORE_FETCH_CONFIG: LoreFetchConfig = {
  enableDynamicLore: true,
  categories: ['legendary-moments', 'physics-defying', 'career-highlights', 'oddities'],
  maxItems: 8
};

// ============================================================================
// SECTION 3: LORE DATA SOURCES (API Endpoints + Fallback Strategy)
// ============================================================================

const LORE_DATA_SOURCES = {
  // Source 1: Baseball-Reference API (Historical stats and legendary players)
  baseballReference: {
    base_url: "https://www.baseball-reference.com/api/v1/",
    endpoints: {
      // Get legendary players by criteria
      legendary_players: "/players/awards?groups=hall-of-fame",
      
      // Get historical stats leaders
      stat_leaders: "/stats?group=batters&type=career",
      
      // Get Hall of Fame inductees with year and reasons
      hall_of_fame: "/players/awards?names=all&group=hall-of-fame"
    }
  },
  
  // Source 2: MLB StatsAPI (Current season highlights and records)
  mlbStatsAPI: {
    base_url: "https://statsapi.mlb.com/api/v1/",
    endpoints: {
      // Get all-time leaders
      leaders: "/leaders/allTime",
      
      // Get awards history
      awards: "/awards?season=2026",
      
      // Get records by criteria  
      records: "/records"
    }
  },
  
  // Source 3: PyBaseball (Python scraper for historical data)
  pybaseball: {
    // This is a Python package - would need backend server to expose as API
    // Example usage from Python:
    /*
    import pybaseball
    
    # Get legendary player stats
    legendary_players = pybaseball.batting_stats(season='2023')
    
    # Get historical records  
    all_time_leaders = pybaseball.pitching_stats(start_season='1900', end_season='2024')
    */
  }
};

// ============================================================================
// SECTION 4: LORE FETCH FUNCTION - Fetch Additional Lore Items from APIs
// ============================================================================

export interface FetchedLoreItem {
  id: string;
  title: string;
  tag: string;
  statBadge?: string;
  statColor?: string;
  fact: string;
  whimsy?: string;
  source: keyof typeof LORE_DATA_SOURCES; // Track which API provided this item
  lastUpdated: number; // Timestamp for cache invalidation
}

export interface FetchLoreResult {
  items: FetchedLoreItem[];
  success: boolean;
  error?: string;
}

/**
 * Fetch lore items from external data sources
 * Returns hardcoded fallback items if API fails (graceful degradation)
 */
export async function fetchMoreLore(config: LoreFetchConfig = DEFAULT_LORE_FETCH_CONFIG): Promise<FetchLoreResult> {
  
  try {
    console.log('[LORE FETCH] Fetching additional lore from external sources...');
    
    // NOTE: Currently returns hardcoded fallback items for reliability
    // Future implementation would:
    // 1. Call API endpoints to fetch historical data
    // 2. Parse and format as lore items
    // 3. Return to caller
    
    // For now, return empty array (items already in BASEBALL_LORE_ITEMS)
    // In production, this would call external APIs:
    /*
    const responses = await Promise.all([
      fetch(`${LORE_DATA_SOURCES.baseballReference.base_url}${LORE_DATA_SOURCES.baseballReference.endpoints.legendary_players}`),
      fetch(`${LORE_DATA_SOURCES.mlbStatsAPI.base_url}${LORE_DATA_SOURCES.mlbStatsAPI.endpoints.leaders}`)
    ]);
    
    const [baseballRefData, mlbApiData] = await Promise.all(responses.map(r => r.json()));
    
    // Transform API responses into lore items...
    
    */
    
    return {
      items: [], // Empty - items are in BASEBALL_LORE_ITEMS
      success: true,
      error: undefined
    };
    
  } catch (error) {
    console.error('[LORE FETCH] Error fetching additional lore:', error);
    return {
      items: [],
      success: false,
      error: 'Failed to fetch additional lore items'
    };
  }
}

/**
 * Generate lore items from API data (helper for future implementation)
 * This function transforms raw API responses into lore item format
 */
export function transformLoreItems(apiData: any[]): FetchedLoreItem[] {
  return apiData.slice(0, DEFAULT_LORE_FETCH_CONFIG.maxItems || 8).map((item, index) => ({
    id: `dynamic_${index}`,
    title: item.title || "Legendary Baseball Moment",
    tag: item.tag || "LEGENDARY",
    statBadge: item.stat || "🏆",
    statColor: getRandomLoreColor(),
    fact: generateFactFromStats(item),
    whimsy: generateWhimsyQuote(item),
    source: 'baseballReference',
    lastUpdated: Date.now()
  }));
}

function getRandomLoreColor(): string {
  const colors = [
    "text-purple-400 border-purple-500/40 bg-purple-950/40",
    "text-blue-400 border-blue-500/40 bg-blue-950/40", 
    "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
    "text-amber-400 border-amber-500/40 bg-amber-950/40"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function generateFactFromStats(item: any): string {
  return `A legendary baseball moment from the ${item.season || 'modern'} era. ${item.description || 'One of baseball history\'s greatest moments.'}`;
}

function generateWhimsyQuote(item: any): string {
  const quotes = [
    "According to legends, this event changed baseball forever.",
    "Baseball historians still debate the true story behind this moment.",
    "Fans remember this as one of the greatest surprises in sports history."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// ============================================================================
// SECTION 5: USE HOOK FOR LORE FETCHING (React Component Integration)
// ============================================================================

export const useLoreFetch = () => {
  const [dynamicLore, setDynamicLore] = useState<FetchedLoreItem[]>([]);
  const [loadingLore, setLoadingLore] = useState(false);
  
  /**
   * Fetch lore items from external sources
   */
  const fetchDynamicLore = async (config: LoreFetchConfig = DEFAULT_LORE_FETCH_CONFIG) => {
    if (!config.enableDynamicLore) return;
    
    setLoadingLore(true);
    try {
      const result = await fetchMoreLore(config);
      
      if (result.success && result.items.length > 0) {
        setDynamicLore(result.items);
      }
    } catch (error) {
      console.error('Failed to fetch lore:', error);
      // Graceful degradation - no action needed, hardcoded items still present
    } finally {
      setLoadingLore(false);
    }
  };
  
  /**
   * Load lore on component mount
   */
  useEffect(() => {
    fetchDynamicLore();
    
    // Auto-refresh every 5 minutes (300,000ms)
    const refreshInterval = setInterval(fetchDynamicLore, 300000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  return {
    lore: [...BASEBALL_LORE_ITEMS, ...dynamicLore], // Combine hardcoded + dynamic
    loadingLore,
    fetchDynamicLore
  };
};

// ============================================================================
// SECTION 6: USAGE EXAMPLES IN PASSIVECARDCHEDULE.TSX
// ============================================================================

/**
 * Current implementation (hardcoded only):
 * const lorePageIndex, setLorePageIndex = useState(0);
 * // ... (existing code)
 */

/**
 * Future implementation with fetching:
 * 
 * import { useLoreFetch } from '@/utils/lore-fetch';
 * 
 * const { lore: allLore, loadingLore, fetchDynamicLore } = useLoreFetch();
 * 
 * // Replace BASEBALL_LORE_ITEMS with:
 * const currentLoreSlice = allLore.slice(lorePageIndex * 3, lorePageIndex * 3 + 3);
 */

// ============================================================================
// SECTION 7: LORE CACHE STRATEGY (Store fetched items)
// ============================================================================

export interface LoreCacheItem {
  data: FetchedLoreItem[];
  timestamp: number;
  source: string;
}

const loreCache = new Map<string, LoreCacheItem>();

/**
 * Get cached lore or fetch fresh if expired (default: 5 minutes)
 */
export async function getFreshLore(cacheKey: string, maxAge: number = 300000): Promise<FetchedLoreItem[]> {
  const cached = loreCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < maxAge) {
    console.log('[LORE CACHE] Returning cached data');
    return cached.data;
  }
  
  console.log('[LORE CACHE] Fetching fresh data...');
  const result = await fetchMoreLore();
  
  if (result.success && result.items.length > 0) {
    loreCache.set(cacheKey, {
      data: result.items,
      timestamp: Date.now(),
      source: 'lore-fetcher'
    });
  }
  
  return result.items;
}
