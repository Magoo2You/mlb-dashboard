/**
 * LORE FETCHER - Fetch legendary baseball moments from historical APIs
 * 
 * This function demonstrates fetching lore items from the Public MLB API
 * which provides JSON data with CORS support for client-side access.
 */

interface BaseballHistoricalRecord {
  name_display_first_last: string;
  name_first: string;
  name_last: string;
  era?: number;
  wins?: number;
  losses?: number;
  strikeouts?: number;
  games?: number;
}

interface PlayerStatsResponse {
  leader_pitching_mux: {
    copyRight: string;
    sort_column: string;
    queryResults: {
      created: string;
      totalSize: number;
      row: BaseballHistoricalRecord[];
    };
  };
}

/**
 * Fetches legendary players from Public MLB API
 * Uses endpoints for historical stats with CORS support
 */
export async function fetchLegendaryLore(): Promise<BaseballHistoricalRecord[]> {
  try {
    // Using Public MLB API (CORS-enabled, no auth required)
    const response = await fetch(
      "https://pseudo-r.github.io/Public-MLB-API/api/leader_pitching_mux"
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data: PlayerStatsResponse = await response.json();
    
    // Transform API data into lore items
    return data.leader_pitching_mux.queryResults.row.map((player: BaseballHistoricalRecord) => {
      const fullName = player.name_display_first_last;
      
      // Create lore item from historical data
      return {
        id: generateLoreId(fullName, player.era),
        title: `${fullName} (${player.era?.toFixed(2)} ERA)`,
        tag: "HALL OF FAME LEGEND",
        headshotUrl: getHeadshotUrl(player.name_first || "", player.name_last || ""),
        statBadge: `ERA ${player.era}`,
        statColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
        fact: generateFact(fullName, player),
        whimsy: generateWhimsy(fullName)
      };
    });
    
  } catch (error) {
    console.warn("Lore fetch failed, using hardcoded fallback:", error);
    return []; // Fallback to empty array (hardcoded items still show)
  }
}

/**
 * Fetch legendary hitters from API
 */
export async function fetchLegendaryHitters(): Promise<BaseballHistoricalRecord[]> {
  try {
    const response = await fetch(
      "https://pseudo-r.github.io/Public-MLB-API/api/leader_batting_mux"
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    // Transform batting data into lore items
    const rawData = await response.json();
    return rawData.leader_batting_mux.queryResults.row.map((player) => ({
      id: generateLoreId(player.name_display_first_last, player.obp),
      title: `${player.name_display_first_last} (${player.obp})`,
      tag: "HALL OF FAME LEGEND",
      headshotUrl: getHeadshotUrl(player.name_first || "", player.name_last || ""),
      statBadge: `OBP ${player.obp}`,
      statColor: "text-amber-400 border-amber-500/40 bg-amber-950/40",
      fact: generateFact(player.name_display_first_last, { obp: player.obp }),
      whimsy: generateWhimsy(player.name_display_first_last)
    }));
    
  } catch (error) {
    console.warn("Lore fetch failed, using hardcoded fallback:", error);
    return [];
  }
}

/**
 * Demonstrates API response structure BEFORE integration
 */
export async function demonstrateApiResponse(): Promise<void> {
  console.log("=" * 80);
  console.log("🔬 DEMONSTRATING: API Response Structure");
  console.log("=" * 80);
  
  try {
    const response = await fetch(
      "https://pseudo-r.github.io/Public-MLB-API/api/leader_pitching_mux"
    );
    
    if (response.ok) {
      const data = await response.json();
      
      console.log("\n📊 API Response Structure:");
      console.log(JSON.stringify(data, null, 2));
      
      console.log("\n\n📝 Sample transformation to lore item:");
      if (data.leader_pitching_mux.queryResults.row.length > 0) {
        const samplePlayer = data.leader_pitching_mux.queryResults.row[0];
        
        const loreItem = {
          id: generateLoreId(samplePlayer.name_display_first_last, samplePlayer.era),
          title: `${samplePlayer.name_display_first_last}`,
          tag: "HALL OF FAME LEGEND",
          headshotUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:${samplePlayer.name_first || 'generic'}:headshot:silo:current.png/w_420,q_auto:best/v1/people/${getMlbId(samplePlayer.name_first, samplePlayer.name_last)}/headshot/silo/current`,
          statBadge: `ERA ${samplePlayer.era?.toFixed(2)}`,
          statColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
          fact: `Hall of Fame legend with ${samplePlayer.era} ERA`,
          whimsy: "Legendary pitcher!"
        };
        
        console.log(JSON.stringify(loreItem, null, 2));
      }
    } else {
      console.log(`⚠️  API returned status ${response.status}`);
    }
    
  } catch (error) {
    console.log("⚠️  Could not fetch demo data:", error);
    console.log("   This is expected - the actual integration will use this pattern.");
  }
}

function generateLoreId(name: string, stat?: number): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanName.substring(0, 12) + (stat ? '_' + Math.floor(stat * 10) : "");
}

function getHeadshotUrl(first: string, last: string): string {
  const defaultId = "660271"; // Generic player ID
  if (first && last) {
    // Use generic headshot URL for demo
    return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_420,q_auto:best/v1/people/${defaultId}/headshot/silo/current`;
  }
  return defaultHeadshot;
}

function generateFact(name: string, stats?: any): string {
  // Generate fact from historical data
  const fullName = name.replace(/,/g, " ");
  if (stats?.era) {
    return `${fullName} is a legendary pitcher with a ${stats.era} ERA in the Hall of Fame.`;
  } else if (stats?.obp) {
    return `${fullName} had an incredible on-base percentage of ${stats.obp}.`;
  }
  return `${fullName} is a Hall of Fame legend!`;
}

function generateWhimsy(name: string): string {
  const fullName = name.replace(/,/g, " ");
  // Generate whimsical quote based on player name
  return `"${fullName}: That's just how baseball works!"`;
}

function getMlbId(first: string, last: string): string {
  // Use generic ID for demo purposes
  return "660271";
}
