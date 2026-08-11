🔍 **WHITE SCREEN DIAGNOSTIC - PLEASE TRY THESE STEPS:**

**Step 1: HARD REFRESH YOUR BROWSER** (Most Common Fix)
- Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac) to bypass cache
- OR open DevTools (`F12`) → Right-click Refresh → "Empty Cache and Hard Reload"

**Step 2: CHECK IF SERVER IS RUNNING**
```bash
curl http://localhost:3000/
```
Should show the HTML with `<div id="root"></div>`

**Step 3: OPEN IN DIFFERENT BROWSER**
Sometimes Chrome/Edge/Firefox have cached old builds. Try another browser.

**Step 4: VERIFY BUILD FILES EXIST**
Run this in your terminal:
```bash
ls -la C:/HermesMLBDashboard/dist/
```

**Step 5: CHECK CONSOLE ERRORS**
1. Press `F12` to open DevTools
2. Go to Console tab (yellow icon)
3. Look for red errors starting with "Failed to load..." or "404"
4. Copy any error messages and tell me

---

**QUICK FIX - REBUILD THE APP:**

```bash
cd C:/HermesMLBDashboard
npm run build
```

Then verify the files exist:
- `dist/index.html` (should be ~500 bytes)
- `dist/server.cjs` (should be ~62KB)

---

**IF STILL WHITE - CHECK NETWORK TAB:**
1. Press `F12` → Network tab
2. Refresh page
3. Look for 404 errors on `/assets/*` files
4. If seeing 404s, the build might have failed silently

---

**ALTERNATIVE: RUN DEV SERVER INSTEAD:**

```bash
cd C:/HermesMLBDashboard
npm run dev
```

Then go to `http://localhost:5173/` (Vite dev server)

---

Let me know which step you're on or what errors you see! 🏆
