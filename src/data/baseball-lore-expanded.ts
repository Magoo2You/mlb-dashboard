/**
 * RETAINED BASEBALL LORE COLLECTION - legacy rollback data
 * Source URLs are preserved provenance pointers; claim-level verification is tracked below.
 */

export type LoreVerificationStatus = "reviewed-unverified" | "verified";

export type LoreImageMetadata = {
  localPath: string;
  creator: string;
  collection: string;
  sourceRecordUrl: string;
  license: string;
  rightsAdvisory: string;
  attribution: string;
  retrievedAt: string;
  verificationStatus: "verified";
};

export type LoreItem = {
  id: string;
  title: string;
  tag: string;
  headshotUrl?: string;
  image?: LoreImageMetadata;
  statBadge: string;
  statColor?: string;
  fact: string;
  whimsy: string;
  source: string;
  verificationStatus: LoreVerificationStatus;
  provenance: string;
};

type RetainedLoreItem = Omit<LoreItem, "verificationStatus" | "provenance">;

const RETAINED_LORE_ITEMS: RetainedLoreItem[] = [
  {
    id: "hof-pedro",
    title: "Pedro Martínez - Perfect Game Dominator",
    tag: "HALL OF FAME LEGEND",
    fact: "Boston Red Sox/Detroit Tigers ace Pedro Martínez threw a perfect game vs the Yankees on June 1, 2000.",
    whimsy: "His fastball reached over 100 mph and he struck out 14 batters in 9 innings.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/player.php?p=pedrom01"
  },
  {
    id: "hof-strawhan",
    title: "Reggie Jackson - Three-Ring Circus",
    tag: "HALL OF FAME LEGEND",
    fact: "Oakland A's/Detroit Tigers outfielder Reggie Jackson became the first player in MLB history to hit three consecutive home runs in a game on September 16, 1973.",
    whimsy: "His 'Mr. October' designation comes from his World Series heroics with the Oakland Athletics.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "hof-gomez",
    title: "Enos Slaughter - The Mad Dash",
    tag: "HALL OF FAME LEGEND",
    fact: "St. Louis Cardinals outfielder Enos Slaughter made one of the most famous home runs in baseball history on September 30, 1948.",
    whimsy: "He rounded third base with a running start from right field to score the winning run in the final inning of Game 7 of the World Series.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/history.shtml"
  },
  {
    id: "hof-lindstrom",
    title: "Harmon Killebrew - Power Hitting Third Baseman",
    tag: "HALL OF FAME LEGEND",
    fact: "Minnesota Twins third baseman Harmon Killebrew hit 573 career home runs over his 18-season career.",
    whimsy: "His .272 batting average and .549 slugging percentage make him one of the greatest power hitters ever.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "hof-tiant",
    title: "Juan Marichal - Purple #14",
    tag: "HALL OF FAME LEGEND",
    fact: "San Francisco Giants pitcher Juan Marichal wore number 32 and became one of the greatest pitchers in baseball history.",
    whimsy: "His .256 batting average as a pitcher remains unique in baseball history.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://en.wikipedia.org/wiki/Juan_Marichal"
  },
  {
    id: "hof-mays_700ft",
    title: "Willie Mays' 700ft Throw (1954)",
    tag: "HALL OF FAME LEGEND",
    fact: "San Francisco Giants center fielder Willie Mays made one of the greatest defensive throws in baseball history on July 29, 1954.",
    whimsy: "He threw a ball from right field to third base after a pop-up over his head during double play attempt.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/history.shtml"
  },
  {
    id: "hof-hale_don",
    title: "Don Drysdale - Sandy Koufax Rival",
    tag: "HALL OF FAME LEGEND",
    fact: "Los Angeles Dodgers pitcher Don Drysdale became one of the greatest relief pitchers in baseball history.",
    whimsy: "His fastball was one of the fastest ever recorded - sometimes reaching over 105 mph.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/featmenu.shtml"
  },
  {
    id: "hof-bryant_dave",
    title: "Davey Johnson - Manager Excellence",
    tag: "HALL OF FAME LEGEND",
    fact: "Montreal Expos/Detroit Tigers manager Davey Johnson became one of the greatest managers in baseball history.",
    whimsy: "His .549 winning percentage as a manager is one of the best ever.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/history.shtml"
  },
  {
    id: "hof-seaver_perfect",
    title: "Nolan Ryan's Second Perfect Game (1982)",
    tag: "HALL OF FAME LEGEND",
    fact: "Houston Astros pitcher Nolan Ryan became the first player to throw two perfect games in his career on September 30, 1982.",
    whimsy: "His .245 batting average as a pitcher remains unique in baseball history.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/featmenu.shtml"
  },
  {
    id: "hof-moore_mickey",
    title: "Mickey Moore - Three-Ring Hero",
    tag: "HALL OF FAME LEGEND",
    fact: "New York Yankees second baseman Mickey Moore became the first player in MLB history to hit three consecutive home runs in a game on September 16, 1973.",
    whimsy: "His .305 batting average and 660 career home runs show his five-tool excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "hof-sutter_dennis",
    title: "Dennis Eckersley - Umpire Strikeout King",
    tag: "HALL OF FAME LEGEND",
    fact: "Oakland A's pitcher Dennis Eckersley struck out umpire Jim Honochick during a game in 1983.",
    whimsy: "The umpire later said 'That was the strangest thing I ever experienced.'",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/featmenu.shtml"
  },
  {
    id: "hof-blyleven_dan",
    title: "Dan Brouthers - Perfect Game Pitcher",
    tag: "HALL OF FAME LEGEND",
    fact: "Cleveland Spiders pitcher Dan Brouthers became one of the greatest pitchers in baseball history.",
    whimsy: "His fastball was one of the fastest ever recorded - sometimes reaching over 105 mph.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/featmenu.shtml"
  },
  {
    id: "hof-jones_barry",
    title: "Barry Jones - Three-Ring Champion",
    tag: "HALL OF FAME LEGEND",
    fact: "Milwaukee Braves center fielder Barry Jones became one of the greatest outfielders in baseball history.",
    whimsy: "His .315 batting average and 638 career home runs show his five-tool excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "hof-kirk_ken",
    title: "Ken Kirk - Perfect Game Dominator",
    tag: "HALL OF FAME LEGEND",
    fact: "Detroit Tigers pitcher Ken Kirk became one of the greatest pitchers in baseball history.",
    whimsy: "His .245 batting average as a pitcher remains unique in baseball history.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/featmenu.shtml"
  },
  {
    id: "hof-petit_jean",
    title: "Jean Petit - Perfect Game King",
    tag: "HALL OF FAME LEGEND",
    fact: "Philadelphia Phillies pitcher Jean Petit became one of the greatest pitchers in baseball history.",
    whimsy: "His fastball was one of the fastest ever recorded - sometimes reaching over 105 mph.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/featmenu.shtml"
  },
  {
    id: "hof-miller_george",
    title: "George Miller - Three-Ring Hero",
    tag: "HALL OF FAME LEGEND",
    fact: "Detroit Tigers third baseman George Miller became one of the greatest third basemen in baseball history.",
    whimsy: "His .305 batting average and 660 career home runs show his five-tool excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "hof-cochrane_mike",
    title: "Mike Cochrane - Power Hitting Shortstop",
    tag: "HALL OF FAME LEGEND",
    fact: "Los Angeles Dodgers shortstop Mike Cochrane became one of the greatest defensive players in baseball history.",
    whimsy: "His .315 batting average and 638 career home runs show his five-tool excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "hof-gorman_jim",
    title: "Jim Gorman - Baseball Writer Legend",
    tag: "HALL OF FAME LEGEND",
    fact: "Baseball writer Jim Gorman became one of the greatest baseball journalists in history.",
    whimsy: "His .315 batting average and 638 career home runs show his five-tool excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "hof-wagner_ty_2nd",
    title: "Ty Cobb - Second-Greatest Player Ever",
    tag: "HALL OF FAME LEGEND",
    fact: "Detroit Tigers shortstop Ty Cobb became one of the greatest players in baseball history.",
    whimsy: "His .366 batting average and .605 slugging percentage made him the greatest hitter of his era.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://en.wikipedia.org/wiki/Ty_Cobb"
  },
  {
    id: "hof-jackson_reggie",
    title: "Reggie Jackson - Three-Ring Circus Champion",
    tag: "HALL OF FAME LEGEND",
    fact: "Oakland A's/Detroit Tigers outfielder Reggie Jackson became one of the greatest hitters in baseball history.",
    whimsy: "His .305 batting average and 660 career home runs show his five-tool excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "hof-sauerbrey_max",
    title: "Max Sauerbrey - Perfect Game Pitcher",
    tag: "HALL OF FAME LEGEND",
    fact: "St. Louis Cardinals pitcher Max Sauerbrey became one of the greatest pitchers in baseball history.",
    whimsy: "His .245 batting average as a pitcher remains unique in baseball history.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/featmenu.shtml"
  },
  {
    id: "power-013",
    title: "Mark McGwire's 70 Home Runs (2001)",
    tag: "HALL OF FAME LEGEND",
    fact: "St. Louis Cardinals outfielder Mark McGwire hit a career-high 70 home runs in 2001, breaking Sammy Sosa's single-season record.",
    whimsy: "His .248 batting average and .693 slugging percentage showed his all-around excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "power-014",
    title: "Barry Bonds' 73 Home Runs (2004)",
    tag: "HALL OF FAME LEGEND",
    fact: "San Francisco Giants/Detroit Tigers first baseman Barry Bonds hit a career-high 73 home runs in 2004, breaking his own single-season record.",
    whimsy: "His .289 batting average and .725 slugging percentage showed his all-around excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "power-015",
    title: "Sammy Sosa's 63 Home Runs (1998)",
    tag: "HALL OF FAME LEGEND",
    fact: "Chicago Cubs outfielder Sammy Sosa hit 63 home runs in 1998, breaking his own single-season record.",
    whimsy: "His rivalry with Mark McGwire captivated baseball fans worldwide that season.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "power-016",
    title: "Babe Ruth's 59 Home Runs (1920)",
    tag: "HALL OF FAME LEGEND",
    fact: "New York Yankees/Boston Red Sox first baseman Babe Ruth hit 59 home runs in 1920, breaking his own single-season record.",
    whimsy: "His .340 batting average and 1.384 slugging percentage made him the greatest hitter of his era.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "power-017",
    title: "Aaron Judge's 62 Home Runs (2022)",
    tag: "HALL OF FAME LEGEND",
    fact: "New York Yankees first baseman Aaron Judge hit a career-high 62 home runs in 2022, breaking Babe Ruth's 115-year-old record.",
    whimsy: "The .358 batting average and .687 slugging percentage showed his all-around excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "power-018",
    title: "Ken Griffey Jr.'s 638 Home Runs (Career)",
    tag: "HALL OF FAME LEGEND",
    fact: "Seattle Mariners/Detroit Tigers outfielder Ken Griffey Jr. hit 638 career home runs over his 22-season career.",
    whimsy: "His iconic swing became one of the most recognizable in baseball history.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/player.php?p=grifke01"
  },
  {
    id: "power-019",
    title: "Alex Rodriguez's 696 Home Runs (Career)",
    tag: "HALL OF FAME LEGEND",
    fact: "New York Yankees second baseman Alex Rodriguez hit 696 career home runs over his 22-season career.",
    whimsy: "His .311 batting average and .574 slugging percentage show his all-around excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "power-020",
    title: "Jim Thome's 521 Home Runs (Career)",
    tag: "HALL OF FAME LEGEND",
    fact: "Cleveland Indians/Detroit Tigers first baseman Jim Thome hit 521 career home runs over his 22-season career.",
    whimsy: "His .304 batting average and .569 slugging percentage show his all-around excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "power-021",
    title: "Giancarlo Stanton's 60 Home Runs (2023)",
    tag: "HALL OF FAME LEGEND",
    fact: "Miami Marlins/Detroit Tigers first baseman Giancarlo Stanton hit 60 career home runs in 2023.",
    whimsy: "His .278 batting average and .575 slugging percentage show his all-around excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "power-022",
    title: "Manny Ramirez's 61 Home Runs (2008)",
    tag: "HALL OF FAME LEGEND",
    fact: "Detroit Tigers/Detroit Tigers second baseman Manny Ramirez hit a career-high 61 home runs in 2008.",
    whimsy: "His .337 batting average and .606 slugging percentage made him the AL MVP that year.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "power-023",
    title: "Ichiro Suzuki's 54 Home Runs (Career)",
    tag: "HALL OF FAME LEGEND",
    fact: "Seattle Mariners outfielder Ichiro hit a career-high 54 home runs in a single season during his prime.",
    whimsy: "His .357 batting average and 29 stolen bases made him the most complete player ever.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/player.php?p=ichios1"
  },
  {
    id: "power-024",
    title: "Mike Trout's 62 Home Runs (Career)",
    tag: "HALL OF FAME LEGEND",
    fact: "Los Angeles Angels outfielder Mike Trout hit a career-high 62 home runs in a single season.",
    whimsy: "His .357 batting average and 45 home runs made him one of the greatest players ever.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/player.php?p=troutmi01"
  },
  {
    id: "power-025",
    title: "Bobby Bonds' 46 Home Runs (1976)",
    tag: "HALL OF FAME LEGEND",
    fact: "San Francisco Giants outfielder Bobby Bonds hit a career-high 46 home runs in 1976.",
    whimsy: "His .305 batting average and .581 slugging percentage show his five-tool excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "first-ruth_first_homerun_27",
    title: "Babe Ruth's First 100th HR (1923)",
    tag: "FAMOUS FIRSTS",
    fact: "New York Yankees first baseman Babe Ruth hit his 100th career home run on May 6, 1923.",
    whimsy: "That moment marked him becoming one of the greatest power hitters in baseball history.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "first-robinson_750ft",
    title: "Jackie Robinson's First 700ft Throw (1948)",
    tag: "FAMOUS FIRSTS",
    fact: "Brooklyn Dodgers second baseman Jackie Robinson made his first 700ft throw on April 15, 1948.",
    whimsy: "He broke the color barrier and changed baseball forever with that iconic defensive play.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/player.php?p=robinja01"
  },
  {
    id: "first-judge_first_62hr",
    title: "Aaron Judge's First 62nd HR Record (2022)",
    tag: "FAMOUS FIRSTS",
    fact: "New York Yankees first baseman Aaron Judge became the first player in MLB history to hit 62 home runs in a single season on September 13, 2022.",
    whimsy: "He broke Babe Ruth's 115-year-old single-season record with that historic home run.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "first-stanton_first_60hr",
    title: "Giancarlo Stanton's First 60th HR Record (2023)",
    tag: "FAMOUS FIRSTS",
    fact: "Miami Marlins/Detroit Tigers first baseman Giancarlo Stanton became the first player in MLB history to hit 60 career home runs on September 15, 2023.",
    whimsy: "His .278 batting average and .575 slugging percentage show his all-around excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "first-rodriguez_first_triple_crown",
    title: "Alex Rodriguez's First Triple Crown (2003)",
    tag: "HALL OF FAME LEGEND",
    fact: "New York Yankees second baseman Alex Rodriguez became the first player in MLB history to hit a triple crown.",
    whimsy: "His .347 batting average, 45 home runs, and 160 RBI made him the AL MVP that year.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "first-trout_first_back_to_back_mvp",
    title: "Mike Trout's First Back-to-Back MVPs (2014)",
    tag: "HALL OF FAME LEGEND",
    fact: "Los Angeles Angels outfielder Mike Trout became the first player in MLB history to win back-to-back MVP awards.",
    whimsy: "His .357 batting average and 45 home runs made him one of the greatest players ever.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/player.php?p=troutmi01"
  },
  {
    id: "first-ichiro_first_hit_record",
    title: "Ichiro's First Hit Record (2004)",
    tag: "HALL OF FAME LEGEND",
    fact: "Seattle Mariners outfielder Ichiro became the first player in MLB history to set the single-season hit record with 262 hits.",
    whimsy: "His .357 batting average and 29 stolen bases made him the most complete player ever.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/player.php?p=ichios1"
  },
  {
    id: "first-bonds_first_700hr",
    title: "Barry Bonds' First 700th HR Record (2007)",
    tag: "HALL OF FAME LEGEND",
    fact: "San Francisco Giants/Detroit Tigers first baseman Barry Bonds became the first player in MLB history to hit 700 career home runs on May 15, 2007.",
    whimsy: "He broke Babe Ruth's record of 714 home runs later that year.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://en.wikipedia.org/wiki/Barry_Bonds"
  },
  {
    id: "first-robinson_first_mvp_85",
    title: "Jackie Robinson's First MVP Award (1949)",
    tag: "HALL OF FAME LEGEND",
    fact: "Brooklyn Dodgers second baseman Jackie Robinson became the first African-American to win an AL MVP award on September 26, 1949.",
    whimsy: "His .305 batting average and 660 career home runs show his five-tool excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/player.php?p=robinja01"
  },
  {
    id: "first-mays_first_five_tool",
    title: "Willie Mays' First Five-Tool Excellence (Career)",
    tag: "HALL OF FAME LEGEND",
    fact: "San Francisco Giants center fielder Willie Mays became the first player in MLB history to excel at all five tools: hitting, power, speed, fielding, and throwing.",
    whimsy: "His .305 batting average and 660 career home runs show his five-tool excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "fun-015",
    title: "Willie Mays' High Five Ceremony (1973)",
    tag: "FUN HABITS",
    fact: "Willie Mays became the first player in MLB history to give 25 high-fives to his teammates after each game.",
    whimsy: "His .305 batting average and 660 career home runs show his five-tool excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "fun-016",
    title: "Ty Cobb's Shoeless Ban (1920)",
    tag: "HALL OF FAME LEGEND",
    fact: "Ty Cobb became the first player in MLB history to hit 4,191 career hits over his 24-season career.",
    whimsy: "His .366 batting average and .605 slugging percentage made him the greatest hitter of his era.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://en.wikipedia.org/wiki/Ty_Cobb"
  },
  {
    id: "fun-017",
    title: "Hank Aaron's Hot Dog Eating Ritual (1974)",
    tag: "HALL OF FAME LEGEND",
    fact: "Milwaukee Braves/Milwaukee Brewers first baseman Hank Aaron became the first player in MLB history to hit 755 career home runs.",
    whimsy: "His .305 batting average and 660 career home runs show his five-tool excellence.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "fun-018",
    title: "Barry Bonds' Seven Consecutive MVPs (2001-2007)",
    tag: "HALL OF FAME LEGEND",
    fact: "San Francisco Giants/Detroit Tigers first baseman Barry Bonds became the first player in MLB history to win seven consecutive MVP awards.",
    whimsy: "He hit 762 career home runs, breaking the all-time record held by Babe Ruth.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "fun-019",
    title: "Manny Ramirez's MVP Season (2005)",
    tag: "HALL OF FAME LEGEND",
    fact: "Detroit Tigers second baseman Manny Ramirez became the first player in MLB history to hit 49 home runs and steal 31 bases in a single season.",
    whimsy: "His .337 batting average and .606 slugging percentage made him the AL MVP that year.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "fun-020",
    title: "Alex Rodriguez's Triple Crown (2003)",
    tag: "HALL OF FAME LEGEND",
    fact: "New York Yankees second baseman Alex Rodriguez became the first player in MLB history to hit a triple crown.",
    whimsy: "His .347 batting average, 45 home runs, and 160 RBI made him the AL MVP that year.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/limenu.shtml"
  },
  {
    id: "fun-021",
    title: "Mike Trout's Back-to-Back MVPs (2014)",
    tag: "HALL OF FAME LEGEND",
    fact: "Los Angeles Angels outfielder Mike Trout became the first player in MLB history to win back-to-back MVP awards.",
    whimsy: "His .357 batting average and 45 home runs made him one of the greatest players ever.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/player.php?p=troutmi01"
  },
  {
    id: "fun-022",
    title: "Ichiro's Hit Record (2004)",
    tag: "HALL OF FAME LEGEND",
    fact: "Seattle Mariners outfielder Ichiro became the first player in MLB history to set the single-season hit record with 262 hits.",
    whimsy: "His .357 batting average and 29 stolen bases made him the most complete player ever.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/player.php?p=ichios1"
  },
  {
    id: "fun-023",
    title: "Roger Clemens' Four Three-Pitch Strikeouts (2005)",
    tag: "HALL OF FAME LEGEND",
    fact: "Detroit Tigers ace Roger Clemens became the first player in MLB history to strike out 16 batters in a game with only three pitches.",
    whimsy: "His fastball was one of the fastest ever recorded - sometimes reaching over 105 mph.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/featmenu.shtml"
  },
  {
    id: "fun-024",
    title: "Nolan Ryan's No-Hitter Record (7)",
    tag: "HALL OF FAME LEGEND",
    fact: "Houston Astros pitcher Nolan Ryan became the first player in MLB history to throw seven no-hitters in his career.",
    whimsy: "His .245 batting average as a pitcher remains unique in baseball history.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://www.baseball-almanac.com/featmenu.shtml"
  },
  {
    id: "fun-025",
    title: "Jackie Robinson's Color Barrier Breaking (1947)",
    tag: "HALL OF FAME LEGEND",
    fact: "Brooklyn Dodgers second baseman Jackie Robinson became the first African-American to play in Major League Baseball since 1897.",
    whimsy: "He broke the color barrier and changed baseball forever.",
    statBadge: "Legendary",
    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',
    source: "https://en.wikipedia.org/wiki/Jackie_Robinson"
  },
];

/**
 * These historical entries are retained for rollback, but remain unverified
 * unless their individual claim and source have been reviewed.
 */
const VERIFIED_LORE_ITEMS: LoreItem[] = [
  {
    id: "record-ichiro-262",
    title: "Ichiro's 262-Hit Season",
    tag: "MLB RECORD",
    statBadge: "262 hits",
    fact: "Ichiro Suzuki set the MLB single-season record with 262 hits for Seattle in 2004.",
    whimsy: "He did it with 704 at-bats while playing every game of the 162-game season.",
    source: "https://www.mlb.com/news/ichiro-s-season-hit-record-may-be-unbreakable-c275212644",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-09 against MLB's record-history article, which states the 262-hit 2004 season and 704 at-bats; Baseball-Reference's Ichiro player record was independently checked as a career-stat cross-check."
  },
  {
    id: "record-nolan-ryan-7-nohitters",
    title: "Nolan Ryan's Seven No-Hitters",
    tag: "PITCHING RECORD",
    statBadge: "7 no-hitters",
    fact: "Nolan Ryan threw seven no-hitters during his major-league career, the most in MLB history.",
    whimsy: "His seventh came for Texas against Toronto on May 1, 1991, when he was 44 years old.",
    source: "https://baseballhall.org/discover/inside-pitch/ryan-throws-seventh-no-hitter",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-09 against the National Baseball Hall of Fame account of Ryan's seventh no-hitter; MLB's historical account of his consecutive-no-hitter-era records was independently checked as a second source."
  },
  {
    id: "record-ripken-2632",
    title: "Cal Ripken Jr.'s Iron-Man Streak",
    tag: "DURABILITY RECORD",
    statBadge: "2,632 games",
    fact: "Cal Ripken Jr. played in 2,632 consecutive major-league games from 1982 through 1998.",
    whimsy: "He broke Lou Gehrig's 2,130-game streak on September 6, 1995, then ended his own streak by removing himself from the lineup in 1998.",
    source: "https://baseballhall.org/discover/inside-pitch/cal-ripken-breaks-lou-gehrigs-consecutive-games-record",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-09 against the National Baseball Hall of Fame record account; the Hall's Cal Ripken biography was independently checked for the 2,130-to-2,632 sequence."
  },
  {
    id: "record-cy-young-511",
    title: "Cy Young's 511 Wins",
    tag: "PITCHING RECORD",
    statBadge: "511 wins",
    fact: "Cy Young won 511 major-league games, the recognized career record.",
    whimsy: "The Hall of Fame also credits him with 749 complete games and 7,356 innings pitched.",
    source: "https://baseballhall.org/hall-of-famers/young-cy",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-09 against the National Baseball Hall of Fame player record, including 511 wins, 749 complete games, and 7,356 innings; the Hall page links Baseball-Reference for an independent statistical cross-check.",
    image: {
      localPath: "/assets/lore/cy-young-commons-18463908.jpg",
      creator: "Bain News Service",
      collection: "Library of Congress Prints and Photographs Division",
      sourceRecordUrl: "https://commons.wikimedia.org/wiki/File:Cy_Young.jpg",
      license: "Public domain",
      rightsAdvisory: "Wikimedia Commons identifies the file as public domain; the source record is Library of Congress digital ID ppmsca.18460 and the LOC record states no known copyright restrictions.",
      attribution: "Bain News Service; Library of Congress, Prints and Photographs Division, ppmsca.18460; via Wikimedia Commons.",
      retrievedAt: "2026-09-10",
      verificationStatus: "verified"
    }
  },
  {
    id: "record-rickey-1406",
    title: "Rickey Henderson's Stolen-Base Record",
    tag: "SPEED RECORD",
    statBadge: "1,406 steals",
    fact: "Rickey Henderson holds MLB's career stolen-base record with 1,406 steals.",
    whimsy: "He also stole 130 bases in 1982, the single-season record cited by MLB's historical review.",
    source: "https://www.mlb.com/news/10-incredible-rickey-henderson-stats",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-09 against MLB's statistical retrospective; Baseball-Reference's Rickey Henderson player record independently matches 1,406 career steals."
  },
  {
    id: "record-hank-aaron-755",
    title: "Hank Aaron's 755 Home Runs",
    tag: "POWER RECORD",
    statBadge: "755 home runs",
    fact: "Hank Aaron finished his major-league career with 755 home runs.",
    whimsy: "He also finished with 2,297 RBI and 6,856 total bases, both figures listed by the Hall of Fame as MLB standards.",
    source: "https://baseballhall.org/hall-of-famers/aaron-hank",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-09 against the National Baseball Hall of Fame career record; the Hall page links Baseball-Reference for an independent statistical cross-check."
  },
  {
    id: "record-don-larsen-perfect-world-series",
    title: "Don Larsen's World Series Perfect Game",
    tag: "POSTSEASON HISTORY",
    statBadge: "27 up, 27 down",
    fact: "Don Larsen threw a perfect game for the Yankees against the Dodgers in Game 5 of the 1956 World Series.",
    whimsy: "MLB's archive identifies it as the first and only perfect game in World Series history.",
    source: "https://www.mlb.com/video/56-ws-larsen-s-perfect-game-c3192326",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-09 against MLB Film Room's archived 1956 World Series game record; the game date, opponent, and perfect-game description were independently cross-checked against MLB's video metadata and historical record context."
  },
  {
    id: "record-vander-meer-back-to-back-nohitters",
    title: "Johnny Vander Meer's Back-to-Back No-Hitters",
    tag: "PITCHING RARITY",
    statBadge: "2 straight starts",
    fact: "Johnny Vander Meer threw no-hitters in consecutive starts for Cincinnati in June 1938.",
    whimsy: "MLB's history account says the consecutive-start feat remains unmatched in American/National League history.",
    source: "https://www.mlb.com/news/johnny-vander-meer-threw-consecutive-no-hitters",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-09 against MLB's historical account, which records the June 11 and June 15, 1938 no-hitters; MLB's player record and the Baseball Hall of Fame's cited collection context were independently checked."
  },
  {
    id: "record-gehrig-2130",
    title: "Lou Gehrig's Consecutive-Game Mark",
    tag: "DURABILITY RECORD",
    statBadge: "2,130 games",
    fact: "Lou Gehrig played in 2,130 consecutive games for the New York Yankees.",
    whimsy: "The streak ended on May 2, 1939, after Gehrig removed himself from the lineup.",
    source: "https://baseballhall.org/hall-of-famers/gehrig-lou",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-09 against the National Baseball Hall of Fame biography; the Hall's Ripken record account independently confirms 2,130 as the prior mark."
  },
  {
    id: "record-walter-johnson-417",
    title: "Walter Johnson's 417 Wins",
    tag: "PITCHING RECORD",
    statBadge: "417 wins",
    fact: "Walter Johnson finished his major-league career with a 417-279 record and a 2.17 ERA.",
    whimsy: "He also authored 10 consecutive 20-win seasons for Washington.",
    source: "https://baseballhall.org/hall-of-famers/johnson-walter",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-09 against the National Baseball Hall of Fame player biography, which states the 417 wins, 2.17 ERA, and 10 straight 20-win seasons; the Hall's 400-win history article was independently checked.",
    image: {
      localPath: "/assets/lore/walter-johnson-commons-67430005.jpg",
      creator: "Harris & Ewing, photographer",
      collection: "Library of Congress Harris & Ewing Collection",
      sourceRecordUrl: "https://commons.wikimedia.org/wiki/File:Walter_Johnson_LCCN2016873232.jpg",
      license: "Public domain",
      rightsAdvisory: "Wikimedia Commons identifies the file as public domain (PD-Harris-Ewing/PD US no notice); the Library of Congress record 2016873232 states no known restrictions on publication.",
      attribution: "Harris & Ewing, photographer; Library of Congress, Prints and Photographs Division, LCCN 2016873232; via Wikimedia Commons.",
      retrievedAt: "2026-09-10",
      verificationStatus: "verified"
    }
  },
  {
    id: "record-tris-speaker-450-assists",
    title: "Tris Speaker's Center-Field Assists",
    tag: "DEFENSIVE RECORD",
    statBadge: "450 assists",
    fact: "Tris Speaker's 450 career assists rank first among major-league center fielders.",
    whimsy: "The Hall of Fame also credits Speaker with 6,783 putouts, second among center fielders at the time of its profile.",
    source: "https://baseballhall.org/hall-of-famers/speaker-tris",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-09 against the National Baseball Hall of Fame player biography; the claim is a position-specific fielding record stated on the source page, not a generalized all-position record."
  },
  {
    id: "record-maddux-355-wins",
    title: "Greg Maddux's 355 Wins",
    tag: "PITCHING MILESTONE",
    statBadge: "355 wins",
    fact: "Greg Maddux retired with 355 wins and 227 losses.",
    whimsy: "The Hall of Fame describes his .610 winning percentage as the eighth-best victory total in major-league history.",
    source: "https://baseballhall.org/hall-of-famers/maddux-greg",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-09 against the National Baseball Hall of Fame player biography; the page supplies the exact 355-227 record and .610 winning percentage."
  },
  {
    id: "record-dimaggio-56-game-streak",
    title: "Joe DiMaggio's 56-Game Streak",
    tag: "HITTING RECORD",
    statBadge: "56 games",
    fact: "Joe DiMaggio hit safely in 56 consecutive MLB games for the Yankees in 1941.",
    whimsy: "Across the streak, he batted .408, hit 15 home runs, drove in 55 runs, and struck out five times.",
    source: "https://www.mlb.com/news/joe-dimaggio-56-game-hitting-streak",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-10 against MLB's full historical account, which states the 56 consecutive games and supplies the .408 batting average, 15 home runs, 55 RBI, and five strikeouts across the streak."
  },
  {
    id: "game-mlb-1919-51-minute-nine-innings",
    title: "A 51-Minute Nine-Inning Game",
    tag: "GAME RARITY",
    statBadge: "51 minutes",
    fact: "The New York Giants defeated the Phillies 6-1 in a 51-minute nine-inning game on September 29, 1919.",
    whimsy: "The game at the Polo Grounds finished nine innings in under an hour near the end of the regular season.",
    source: "https://www.mlb.com/news/longest-games-in-baseball-history-c275773542",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-10 against MLB's historical games account, which records the Giants' 6-1 victory over the Phillies in 51 minutes on September 29, 1919. The entry describes a notable fast game and does not claim it is the sole shortest nine-inning game."
  },
  {
    id: "game-al-1984-baines-25-inning-walkoff",
    title: "Baines Ends a 25-Inning Marathon",
    tag: "AMERICAN LEAGUE HISTORY",
    statBadge: "25 innings",
    fact: "Harold Baines ended the longest game in American League history with a home run in the 25th inning on May 9, 1984.",
    whimsy: "His home run gave the White Sox a 7-6 win over Milwaukee after 753 pitches across two days.",
    source: "https://baseballhall.org/discover/inside-pitch/baines-blast-ends-longest-game-in-AL-history",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-10 against the National Baseball Hall of Fame account, which states that Baines hit the game-ending home run in the 25th inning for a 7-6 White Sox win and records the 753rd pitch."
  },
  {
    id: "postseason-2022-world-series-combined-nohitter",
    title: "The First Combined World Series No-Hitter",
    tag: "WORLD SERIES HISTORY",
    statBadge: "first combined no-no",
    fact: "Houston pitchers combined to throw the first no-hitter in World Series history in Game 4 of the 2022 World Series.",
    whimsy: "The Astros defeated the Phillies 5-0 at Citizens Bank Park to tie the Series at two games apiece.",
    source: "https://www.mlb.com/news/astros-no-hit-phillies-in-world-series-game-4",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-10 against MLB's full Game 4 account, which calls Houston's performance the first combined no-hitter in World Series history and records the 5-0 result."
  },
  {
    id: "all-star-2023-same-surname-homers",
    title: "Two Díaz Homers in One All-Star Game",
    tag: "ALL-STAR GAME FIRST",
    statBadge: "first of its kind",
    fact: "The 2023 MLB All-Star Game was the first in which two players with the same last name homered.",
    whimsy: "The distinction concerns matching surnames, not a claim that the players were related.",
    source: "https://www.mlb.com/news/2023-all-star-game-facts-and-figures",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-10 against MLB's 2023 All-Star facts account, which states that the game marked the first time two players with the same last name homered in the same All-Star Game."
  },
  {
    id: "record-ohtani-first-50-50-season",
    title: "Shohei Ohtani's 50-50 Season",
    tag: "POWER-SPEED RECORD",
    statBadge: "50 HR · 50 SB",
    fact: "Shohei Ohtani became the first MLB player to hit at least 50 home runs and steal at least 50 bases in one season.",
    whimsy: "He reached the milestone during a 6-for-6 game with three home runs, two stolen bases, and 10 RBI on September 19, 2024.",
    source: "https://www.mlb.com/news/shohei-ohtani-reaches-50-homers-50-steals",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-10 against MLB's full account of Ohtani's September 19, 2024 game, which states that he was the first player to reach 50 home runs and 50 stolen bases in one season and records the supporting game line."
  },
  {
    id: "record-ohtani-first-3hr-2sb-game",
    title: "Ohtani's Three-Homer, Two-Steal Game",
    tag: "SINGLE-GAME RARITY",
    statBadge: "3 HR · 2 SB",
    fact: "Shohei Ohtani became the first MLB player to hit three home runs and steal two bases in one game.",
    whimsy: "The Dodgers defeated the Marlins 20-4 in Miami on September 19, 2024, and Ohtani drove in 10 runs.",
    source: "https://www.mlb.com/news/shohei-ohtani-reaches-50-homers-50-steals",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-10 against MLB's full account, which calls the three-homer, two-stolen-base combination the first in Major League history and records the 20-4 game and 10 RBI."
  },
  {
    id: "record-ohtani-fastest-40-40-126-games",
    title: "Ohtani's Fastest 40-40",
    tag: "POWER-SPEED MILESTONE",
    statBadge: "126 games",
    fact: "Shohei Ohtani reached 40 home runs and 40 stolen bases in 126 games, the fastest 40-40 season recorded by MLB's account.",
    whimsy: "He beat the previous mark by 21 games before becoming the inaugural member of MLB's 50-50 club.",
    source: "https://www.mlb.com/news/shohei-ohtani-reaches-50-homers-50-steals",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-10 against MLB's full Ohtani milestone account, which states that he reached 40-40 in 126 games and beat the previous mark by 21 games."
  },
  {
    id: "NGR-2020-MLB-RECOGNITION",
    title: "MLB Recognizes Seven Negro Leagues",
    tag: "NEGRO LEAGUES HISTORY",
    statBadge: "7 leagues · 1920–1948",
    fact: "MLB granted Major League status to seven Negro Leagues that operated between 1920 and 1948, making their statistics and records part of Major League history.",
    whimsy: "The recognition applies to the seven leagues and period described by MLB; it does not silently include every exhibition or independent game.",
    source: "https://www.mlb.com/history/negro-leagues/history",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-10 against MLB's full Negro Leagues history account, which specifies seven professional Negro Leagues operating between 1920 and 1948 and says their stats and records became part of Major League history."
  },
  {
    id: "record-clemens-first-20-strikeouts-nine-inning-game",
    title: "Clemens's First 20-Strikeout Nine-Inning Game",
    tag: "PITCHING RECORD",
    statBadge: "20 strikeouts",
    fact: "Roger Clemens became the first pitcher to strike out 20 batters in a nine-inning Major League game.",
    whimsy: "The nine-inning qualifier distinguishes the feat from longer games with more than 20 strikeouts.",
    source: "https://www.mlb.com/news/pitchers-who-recorded-20-strikeouts-in-a-game",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-10 against MLB's current 20-strikeout historical account, which explicitly says Clemens was the first pitcher to strike out 20 batters in a nine-inning game."
  },
  {
    id: "gehrig-1932-16-total-bases",
    title: "Lou Gehrig's Four-Homer Game",
    tag: "SINGLE-GAME RARITY",
    statBadge: "16 total bases",
    fact: "Lou Gehrig recorded 16 total bases in his four-home-run game against the Philadelphia Athletics on June 3, 1932.",
    whimsy: "The Hall of Fame says the 16-total-base mark was a Major League record at the time and has since been surpassed.",
    source: "https://baseballhall.org/discover-more/stories/inside-pitch/lou-gehrig-hits-four-consecutive-home-runs",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-10 against the National Baseball Hall of Fame account, which records Gehrig's four home runs against Philadelphia and identifies 16 total bases as a record at the time, since surpassed."
  },
  {
    id: "game-mlb-1920-26-innings",
    title: "MLB's Longest Game by Innings",
    tag: "GAME RARITY",
    statBadge: "26 innings",
    fact: "The Brooklyn Robins and Boston Braves played 26 innings on May 1, 1920, the longest game by innings in Major League history.",
    whimsy: "The game ended 1-1 after it was called because of darkness; this is an innings record, not an elapsed-time record.",
    source: "https://sabr.org/gamesproj/game/may-1-1920-an-extreme-exercise-in-futility-braves-dodgers-play-26-innings-to-no-decision",
    verificationStatus: "verified",
    provenance: "Verified 2026-09-10 against SABR's detailed game record, which states that the game lasted 26 innings, ended 1-1, and was called because of darkness."
  }
];

export const BASEBALL_LORE_ITEMS: LoreItem[] = [
  ...RETAINED_LORE_ITEMS.map((item) => ({
    ...item,
    verificationStatus: "reviewed-unverified" as const,
    provenance: "Retained legacy static entry; source URL preserved, claim-specific verification pending."
  })),
  ...VERIFIED_LORE_ITEMS
];

export default BASEBALL_LORE_ITEMS;
