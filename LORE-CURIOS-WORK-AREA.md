# 🧪 LORE & CURIOS WORK AREA - Local Development Mode

## ✅ SAFE STATE CONFIRMED
Your working directory is clean. You can modify files without pushing to GitHub.

### Last Known Good Commit:
```
fa2ea17 v1.1.0: Add version notation & changelog tracking
https://github.com/Magoo2You/mlb-dashboard
```

---

## 📍 Current Lore Items (PassiveCardSchedule.tsx)
Located at lines 19-80 in `src/components/PassiveCardSchedule.tsx`:

```typescript
const BASEBALL_LORE_ITEMS = [
  { id: "gaedel", title: "Eddie Gaedel's 3'7\" Strike Zone (1951)", ... },
  { id: "bird", title: "The 1-in-19-Billion Pigeon Fastball (2001)", ... },
  { id: "rickey", title: "Rickey Henderson's Framed Million-Dollar Check", ... },
  { id: "babe", title: "Babe Ruth Out-Hit 14 Entire Teams (1920)", ... },
  { id: "ellis", title: "Dock Ellis' Outer-Space No-Hitter (1970)", ... },
  { id: "pizza", title: "Ichiro's 10-Year Pizza & Toast Ritual", ... }
];
```

---

## 🔧 Quick Commands for Safe Work

### Check Your Changes:
```bash
git status          # See what files were modified
git diff            # Preview changes before committing
```

### Revert to GitHub Version (Instant Undo):
```bash
git reset --hard origin/main
npm run build
node dist/server.cjs
```

### Pull Latest from GitHub:
```bash
git fetch origin main
git checkout origin/main  
npm run build
node dist/server.cjs
```

---

## 📝 How to Modify Lore Items

1. **Edit the file:**
   ```bash
   code src/components/PassiveCardSchedule.tsx
   ```

2. **Common modifications:**
   - Add new lore items
   - Change facts or whimsy quotes
   - Update images or styling

3. **Test changes immediately:**
   ```bash
   npm run dev        # Start dev server
   ```

---

## ⚠️ Before You Commit/ Push

### Option 1: Check what will be pushed:
```bash
git diff            # Preview changes
git status          # See modified files
```

### Option 2: Reset to clean state (if you want to cancel):
```bash
git reset --hard origin/main
npm run build
node dist/server.cjs
```

---

## 🎯 Current Implementation Details

**File:** `src/components/PassiveCardSchedule.tsx`  
**Lines:** 19-80 (lore data), 442-484 (lore display UI)  
**Auto-rotation:** Every 9.2 seconds between tabs  
**UI Theme:** Purple accents with Sparkles icon  

---

## 📋 Available Lore Tags
- "WILD HISTORY" - Eddie Gaedel  
- "STATCAST ODDITY" - Randy Johnson pigeon  
- "LORE & LEGENDS" - Rickey Henderson check  
- "HISTORIC POWER" - Babe Ruth 1920  
- "UNBELIEVABLE" - Dock Ellis space no-hitter  
- "FUN HABITS" - Ichiro pizza ritual  

---

**Ready to work! Your changes are local-only. Use `git reset --hard origin/main` anytime to revert.**
