# ⚠️ LORE & CURIOS WORK AREA - DO NOT PUSH TO GITHUB

## 🛡️ Safety Protocol

### Current Commit (Safe Revert Point):
```
fa2ea17 v1.1.0: Add version notation & changelog tracking
```

### To Reset Anytime (Instant Revert):
```bash
cd C:/HermesMLBDashboard
git reset --hard origin/main
npm run build
node dist/server.cjs
```

### Or Pull Latest Changes:
```bash
git fetch origin main  
git checkout origin/main
npm run build
node dist/server.cjs
```

## 📝 What We're Working On (Local Only)
- Lore & Curios content modifications
- Adding more baseball trivia items
- UI tweaks to the lore section

### Current Files:
- `src/components/PassiveCardSchedule.tsx` - Contains 6 lore items
- Auto-rotates between News / Hot Hitters / Lore tabs

## 🎯 Quick Commands

```bash
# Check what changed since last commit
git status

# See the diff before committing
git diff

# Reset to GitHub version (instant undo)
git reset --hard origin/main

# Pull latest from GitHub
git pull origin main

# Build and start fresh
npm run build && node dist/server.cjs
```
