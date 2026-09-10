/**
 * Separate historical-player profile contract. These records are intentionally
 * not part of the Lore & Curios rotation. Biography facts and statistics retain
 * their provider scope, while unresolved conflicts and media rights leads stay
 * explicit instead of being silently normalized.
 */
export type HistoricalPlayerFact = {
  statement: string;
  scope: string;
  sourceUrls: string[];
  provenance: string;
};

export type HistoricalPlayerStat = {
  label: string;
  value: string;
  seasonOrContext: string;
  scope: string;
  sourceUrls: string[];
  provenance: string;
};

export type HistoricalPlayerMediaLead = {
  subject: string;
  pageOrFileUrl: string;
  creator: string;
  collectionOrItemId: string;
  rightsStatus: "rights-unresolved" | "permission-required";
  attribution: string;
  confidence: "high" | "medium" | "low";
  sourceRecordUrl: string;
  reviewedAt: string;
};

export type HistoricalPlayerProfile = {
  id: string;
  name: string;
  era: string;
  teams: string[];
  biography: string;
  biographyEvidence: HistoricalPlayerFact[];
  verifiedFacts: HistoricalPlayerFact[];
  stats: HistoricalPlayerStat[];
  unresolvedItems?: HistoricalPlayerFact[];
  mediaLeads?: HistoricalPlayerMediaLead[];
  image?: {
    url: string;
    rights: string;
    provenance: string;
  };
  sourceUrls: string[];
  lastReviewed: string;
  verificationStatus: "verified" | "reviewed-unverified";
};

const HALL = "https://baseballhall.org";
const BR = "https://www.baseball-reference.com";

export const HISTORICAL_PLAYER_PROFILES: HistoricalPlayerProfile[] = [
  {
    id: "jackie-robinson",
    name: "Jackie Robinson",
    era: "MLB 1947–1956; Negro Leagues 1945",
    teams: ["Kansas City Monarchs", "Brooklyn Dodgers"],
    biography: "Jackie Robinson was a second baseman for the Brooklyn Dodgers and was inducted into the Hall of Fame in 1962.",
    biographyEvidence: [
      {
        statement: "Jackie Robinson was a second baseman for the Brooklyn Dodgers and was inducted into the Hall of Fame in 1962.",
        scope: "Biography and career context",
        sourceUrls: [`${HALL}/hall-of-famers/robinson-jackie`],
        provenance: "The Hall profile identifies Robinson's position, primary team, and 1962 induction class."
      }
    ],
    verifiedFacts: [
      {
        statement: "Jackie Robinson was born in Cairo in 1919, died in Stamford in 1972, played primarily for the Brooklyn Dodgers, and was inducted into the Hall of Fame in 1962.",
        scope: "Biography and career context",
        sourceUrls: [`${HALL}/hall-of-famers/robinson-jackie`],
        provenance: "The Hall of Fame profile supplies the birth year/place, death year/place, primary team, primary position, and induction class."
      },
      {
        statement: "The Hall of Fame lists Robinson with the Kansas City Monarchs in 1945 and the Brooklyn Dodgers from 1947–1956.",
        scope: "Biography and career context",
        sourceUrls: [`${HALL}/hall-of-famers/robinson-jackie`],
        provenance: "The Hall profile's Played For section separates the 1945 Kansas City Monarchs season from the 1947–1956 Dodgers career."
      }
    ],
    stats: [
      {
        label: "MLB regular-season career hits",
        value: "1,563",
        seasonOrContext: "MLB regular-season career as reported by the Hall",
        scope: "MLB regular-season career",
        sourceUrls: [`${HALL}/hall-of-famers/robinson-jackie`],
        provenance: "The Hall profile reports 1,563 MLB hits; this value is kept separate from Baseball-Reference's alternate 1,568 value and from Robinson's 1945 Monarchs season."
      },
      {
        label: "Baseball-Reference reported career hits",
        value: "1,568",
        seasonOrContext: "Baseball-Reference career summary",
        scope: "Baseball-Reference career summary; coverage includes 1945/Negro League records",
        sourceUrls: [`${BR}/players/r/robinja02.shtml`],
        provenance: "Baseball-Reference's career summary lists 1,568 hits but includes a 1945 entry and warns that Negro League data is incomplete; this is retained as an alternate reported value rather than treated as an uncontested MLB-only total."
      },
      {
        label: "Baseball-Reference reported batting line",
        value: ".313 AVG · .410 OBP · .477 SLG · .887 OPS",
        seasonOrContext: "Baseball-Reference career summary",
        scope: "Baseball-Reference career summary; coverage caveat applies",
        sourceUrls: [`${BR}/players/r/robinja02.shtml`],
        provenance: "Baseball-Reference's career summary provides the batting line, with its historical coverage caveat retained rather than presenting the values as an uncontested MLB-only line."
      }
    ],
    unresolvedItems: [
      {
        statement: "Robinson's MLB career hit totals differ by source: the Hall reports 1,563, while Baseball-Reference reports 1,568; his 1945 Kansas City Monarchs season is separate Negro League scope and Negro League data is incomplete.",
        scope: "MLB career totals and Negro League boundary",
        sourceUrls: [`${HALL}/hall-of-famers/robinson-jackie`, `${BR}/players/r/robinja02.shtml`],
        provenance: "The Hall and Baseball-Reference values are preserved as separate provider reports; no value is silently selected as universally authoritative."
      }
    ],
    mediaLeads: [
      {
        subject: "Jackie Robinson portrait",
        pageOrFileUrl: "https://commons.wikimedia.org/wiki/File:Jackie_Robinson,_Brooklyn_Dodgers,_1954.jpg",
        creator: "Not confirmed in the reviewed record",
        collectionOrItemId: "Commons page 32162285",
        rightsStatus: "rights-unresolved",
        attribution: "Preserve the exact creator/source credit after file-level verification.",
        confidence: "low",
        sourceRecordUrl: "https://commons.wikimedia.org/wiki/File:Jackie_Robinson,_Brooklyn_Dodgers,_1954.jpg",
        reviewedAt: "2026-09-10"
      }
    ],
    sourceUrls: [`${HALL}/hall-of-famers/robinson-jackie`, `${BR}/players/r/robinja02.shtml`],
    lastReviewed: "2026-09-10",
    verificationStatus: "verified"
  },
  {
    id: "roberto-clemente",
    name: "Roberto Clemente",
    era: "MLB 1955–1972",
    teams: ["Pittsburgh Pirates"],
    biography: "Roberto Clemente was a right fielder for the Pittsburgh Pirates and was inducted into the Hall of Fame in 1973.",
    biographyEvidence: [
      {
        statement: "Roberto Clemente was a right fielder for the Pittsburgh Pirates and was inducted into the Hall of Fame in 1973.",
        scope: "Biography and career context",
        sourceUrls: [`${HALL}/hall-of-famers/clemente-roberto`],
        provenance: "The Hall profile identifies Clemente's position, primary team, and 1973 induction class."
      }
    ],
    verifiedFacts: [
      {
        statement: "Roberto Clemente was born in Carolina, Puerto Rico, in 1934, died in San Juan in 1972, played for the Pittsburgh Pirates, and was inducted into the Hall of Fame in 1973.",
        scope: "Biography and career context",
        sourceUrls: [`${HALL}/hall-of-famers/clemente-roberto`],
        provenance: "The Hall of Fame profile supplies the birthplace, birth year, death year/place, primary team, position, and induction class."
      },
      {
        statement: "Clemente recorded his 3,000th and final MLB hit on September 30, 1972, against the Mets.",
        scope: "Biography and career context",
        sourceUrls: ["https://www.mlb.com/pirates/news/featured/roberto-clemente-chase-for-3000-hits"],
        provenance: "MLB's Pirates feature describes the chase and identifies the 3,000th hit as Clemente's final major-league hit."
      }
    ],
    stats: [
      {
        label: "3,000th MLB hit",
        value: "3,000 hits",
        seasonOrContext: "MLB regular-season career milestone; September 30, 1972",
        scope: "MLB regular-season career milestone",
        sourceUrls: ["https://www.mlb.com/pirates/news/featured/roberto-clemente-chase-for-3000-hits"],
        provenance: "The MLB feature explicitly scopes the milestone to major-league hits and identifies the date and opponent."
      },
      {
        label: "1972 batting line",
        value: ".312 AVG · .356 OBP · .479 SLG",
        seasonOrContext: "MLB regular season, 1972; 102 games",
        scope: "MLB regular season, 1972",
        sourceUrls: ["https://www.mlb.com/pirates/news/featured/roberto-clemente-chase-for-3000-hits"],
        provenance: "MLB's feature reports this slash line and 102-game context; it is not presented as a career line."
      }
    ],
    unresolvedItems: [
      {
        statement: "The milestone's descriptive identity should retain MLB's Latino/Latin America terminology; do not silently rewrite it as a different demographic category.",
        scope: "Biography and career context",
        sourceUrls: ["https://www.mlb.com/pirates/news/featured/roberto-clemente-chase-for-3000-hits"],
        provenance: "The source's wording is retained as a scope and terminology safeguard."
      }
    ],
    mediaLeads: [
      {
        subject: "Roberto Clemente portrait",
        pageOrFileUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Roberto_Clemente_1965.jpg",
        creator: "Not confirmed in the reviewed record",
        collectionOrItemId: "Commons file Roberto Clemente 1965.jpg",
        rightsStatus: "rights-unresolved",
        attribution: "Do not publish until creator, source collection, and file-level rights are verified.",
        confidence: "low",
        sourceRecordUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Roberto_Clemente_1965.jpg",
        reviewedAt: "2026-09-10"
      }
    ],
    sourceUrls: [`${HALL}/hall-of-famers/clemente-roberto`, "https://www.mlb.com/pirates/news/featured/roberto-clemente-chase-for-3000-hits"],
    lastReviewed: "2026-09-10",
    verificationStatus: "verified"
  },
  {
    id: "ted-williams",
    name: "Ted Williams",
    era: "MLB 1939–1942 and 1946–1960",
    teams: ["Boston Red Sox"],
    biography: "Ted Williams was a left fielder for the Boston Red Sox who hit .406 in the American League in 1941.",
    biographyEvidence: [
      {
        statement: "Ted Williams was a left fielder for the Boston Red Sox who hit .406 in the American League in 1941.",
        scope: "Biography and career context",
        sourceUrls: [`${HALL}/hall-of-famers/williams-ted`],
        provenance: "The Hall profile supplies Williams's team, hitting achievements, and induction class."
      }
    ],
    verifiedFacts: [
      {
        statement: "Ted Williams played for the Boston Red Sox, was inducted into the Hall of Fame in 1966, won six American League batting titles and two Triple Crowns, and hit .406 in 1941.",
        scope: "Biography and career context",
        sourceUrls: [`${HALL}/hall-of-famers/williams-ted`, `${HALL}/discover-more/stories/baseball-history/ted-williams-retrospective`],
        provenance: "The Hall's profile and retrospective provide the team, induction, awards, and 1941 batting context."
      },
      {
        statement: "Williams missed three full seasons while serving in the Marines and most of the 1952–1953 seasons during Korean War service.",
        scope: "Biography and career context",
        sourceUrls: [`${HALL}/hall-of-famers/williams-ted`],
        provenance: "The Hall profile identifies the military-service gaps; these periods are unavailable playing seasons, not zero-stat seasons."
      }
    ],
    stats: [
      {
        label: "1941 batting average",
        value: ".406",
        seasonOrContext: "American League regular season, 1941",
        scope: "American League regular season, 1941",
        sourceUrls: [`${HALL}/hall-of-famers/williams-ted`],
        provenance: "The Hall identifies .406 in 1941 as the last MLB season at or above .400; the profile retains the American League regular-season scope."
      },
      {
        label: "MLB regular-season career line",
        value: "2,654 H · 521 HR · 1,839 RBI · .344 AVG · .482 OBP · .634 SLG",
        seasonOrContext: "MLB regular-season career",
        scope: "MLB regular-season career",
        sourceUrls: [`${HALL}/hall-of-famers/williams-ted`],
        provenance: "The Hall profile supplies the career games, hits, home runs, RBI, batting average, on-base percentage, and slugging percentage."
      }
    ],
    unresolvedItems: [
      {
        statement: "The Hall's profile reports 19 All-Star selections, while its retrospective reports 18; retain the conflict rather than selecting one silently.",
        scope: "Biography and career context",
        sourceUrls: [`${HALL}/hall-of-famers/williams-ted`, `${HALL}/discover-more/stories/baseball-history/ted-williams-retrospective`],
        provenance: "Both values appear in authoritative Hall-hosted pages reviewed for the pilot. The headline stat block should omit the total until reconciled."
      }
    ],
    mediaLeads: [
      {
        subject: "Ted Williams portrait or final at-bat image",
        pageOrFileUrl: `${HALL}/discover-more/stories/baseball-history/ted-williams-retrospective`,
        creator: "National Baseball Hall of Fame Library; image records BL-68-57 and B-172-60",
        collectionOrItemId: "BL-68-57; B-172-60",
        rightsStatus: "permission-required",
        attribution: "National Baseball Hall of Fame Library; permission/license review required.",
        confidence: "medium",
        sourceRecordUrl: `${HALL}/discover-more/stories/baseball-history/ted-williams-retrospective`,
        reviewedAt: "2026-09-10"
      }
    ],
    sourceUrls: [`${HALL}/hall-of-famers/williams-ted`, `${HALL}/discover-more/stories/baseball-history/ted-williams-retrospective`],
    lastReviewed: "2026-09-10",
    verificationStatus: "verified"
  },
  {
    id: "satchel-paige",
    name: "Satchel Paige",
    era: "Negro Leagues and independent baseball; MLB 1948–1949 and 1951–1953; MLB return 1965",
    teams: ["Kansas City Monarchs", "Cleveland Indians", "St. Louis Browns", "Kansas City Athletics"],
    biography: "Satchel Paige was a pitcher whose professional career included the Negro Leagues and later MLB appearances.",
    biographyEvidence: [
      {
        statement: "Satchel Paige was a pitcher whose professional career included the Negro Leagues and later MLB appearances.",
        scope: "Biography and career context",
        sourceUrls: [`${HALL}/hall-of-famers/paige-satchel`],
        provenance: "The Hall biography identifies Paige's Negro Leagues beginning, pitching position, and 1971 induction."
      }
    ],
    verifiedFacts: [
      {
        statement: "Satchel Paige was born in Mobile in 1906, was inducted into the Hall of Fame in 1971, and is listed with the Kansas City Monarchs as his primary team.",
        scope: "Biography and career context",
        sourceUrls: [`${HALL}/hall-of-famers/paige-satchel`],
        provenance: "The Hall profile supplies the birth, primary-team, position, and induction information."
      },
      {
        statement: "Paige returned to the majors at age 59 for a one-game appearance with the Athletics on September 25, 1965, and pitched three shutout innings.",
        scope: "Biography and career context",
        sourceUrls: [`${HALL}/hall-of-famers/paige-satchel`],
        provenance: "The Hall biography explicitly states the age, club, date, one-game stint, and three shutout innings."
      }
    ],
    stats: [
      {
        label: "MLB career wins, Hall-reported",
        value: "124 wins",
        seasonOrContext: "MLB regular-season career as reported by the Hall",
        scope: "MLB regular-season career, Hall-reported",
        sourceUrls: [`${HALL}/hall-of-famers/paige-satchel`],
        provenance: "The Hall's Career MLB Stats table reports 124 wins, 82 losses, 1,751 innings, 1,501 strikeouts, 22 shutouts, and a 2.73 ERA."
      },
      {
        label: "Baseball-Reference reported career wins",
        value: "132 wins",
        seasonOrContext: "Baseball-Reference career summary",
        scope: "Baseball-Reference career summary; historical coverage caveat applies",
        sourceUrls: [`${BR}/players/p/paigesa01.shtml`],
        provenance: "Baseball-Reference's summary reports 132 wins. Its Negro League coverage note states that the historical data is incomplete; this alternate is retained rather than merged with the Hall value."
      },
      {
        label: "1965 final MLB appearance",
        value: "3 shutout innings",
        seasonOrContext: "MLB regular season; Athletics; September 25, 1965",
        scope: "MLB regular season, single game, 1965",
        sourceUrls: [`${HALL}/hall-of-famers/paige-satchel`],
        provenance: "The Hall biography supplies the appearance context and three shutout innings."
      }
    ],
    unresolvedItems: [
      {
        statement: "Authoritative sources report different MLB career win totals for Paige: 124 from the Hall of Fame and 132 from Baseball-Reference.",
        scope: "Biography and career context",
        sourceUrls: [`${HALL}/hall-of-famers/paige-satchel`, `${BR}/players/p/paigesa01.shtml`],
        provenance: "Both values are preserved with provider and scope labels; no combined Negro League, independent, Mexican League, minor-league, or barnstorming total is presented."
      },
      {
        statement: "Negro League, independent, winter, Mexican League, minor-league, and barnstorming records require separate scopes and completeness notes.",
        scope: "Biography and career context",
        sourceUrls: [`${HALL}/hall-of-famers/paige-satchel`, `${BR}/players/p/paigesa01.shtml`],
        provenance: "The Hall biography lists multiple competition contexts, and Baseball-Reference warns that Negro League data is incomplete."
      }
    ],
    mediaLeads: [
      {
        subject: "Satchel Paige portrait",
        pageOrFileUrl: "https://commons.wikimedia.org/wiki/File:Satchel_Paige_seated_next_to_bleachers_(1).jpg",
        creator: "Not confirmed in the reviewed record",
        collectionOrItemId: "Commons page 121958918",
        rightsStatus: "rights-unresolved",
        attribution: "Do not publish until creator, source collection, and file-level rights are verified.",
        confidence: "low",
        sourceRecordUrl: "https://commons.wikimedia.org/wiki/File:Satchel_Paige_seated_next_to_bleachers_(1).jpg",
        reviewedAt: "2026-09-10"
      }
    ],
    sourceUrls: [`${HALL}/hall-of-famers/paige-satchel`, `${BR}/players/p/paigesa01.shtml`],
    lastReviewed: "2026-09-10",
    verificationStatus: "verified"
  }
];
