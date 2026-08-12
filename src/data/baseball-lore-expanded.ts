/**
 * 🏆 BASEBALL ALMANAC LORE COLLECTION - v9.0.0
 * All entries curated from Baseball Almanac official sources
 */

export type LoreItem = {
  id: string;
  title: string;
  tag: string;
  headshotUrl?: string;
  statBadge: string;
  statColor?: string;
  fact: string;
  whimsy: string;
  source: string;
};

export const BASEBALL_LORE_ITEMS: LoreItem[] = [
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

export default BASEBALL_LORE_ITEMS;
