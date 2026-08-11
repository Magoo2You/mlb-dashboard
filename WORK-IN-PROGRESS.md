# 📋 WORK IN PROGRESS: Lore & Curios Section

## Current State (Last Committed)
- ✅ Baseball lore items already exist in `src/components/PassiveCardSchedule.tsx`
- ✅ 6 lore items implemented (Eddie Gaedel, Randy Johnson's pigeon strikeout, etc.)
- ✅ Auto-rotating tab between News / Hot Hitters / Lore & Curios
- ✅ Purple-themed UI with Sparkles icon

## Available Revert Points
### Option 1: Use Latest GitHub Commit (Recommended)
```bash
# Pull latest version from GitHub to reset your local copy
git fetch origin main
git checkout origin/main
npm run build
node dist/server.cjs
```

### Option 2: Git Reflog (View Recent Changes Without Resetting)
```bash
git reflog
```

## Current Lore Items Implemented:
1. **Eddie Gaedel** - The 3'7" strikeout (1951)
2. **Randy Johnson's Pigeon Strikeout** - 100mph sinker intercepted flying pigeon (2001)
3. **Rickey Henderson's Million-Dollar Check** - Framed instead of cashing
4. **Babe Ruth Out-Hit 14 Teams** - 54 HRs vs entire rosters in 1920
5. **Dock Ellis' Outer-Space No-Hitter** (1970)
6. **Ichiro's Pizza & Toast Ritual** - 10-year pre-game routine

## To Revert Any Changes:
```bash
# View what you're about to lose
git status
git diff

# Reset to last commit from GitHub
git reset --hard origin/main

# Or pull latest safely
git fetch origin main
git reset --hard origin/main
npm run build
node dist/server.cjs
```
