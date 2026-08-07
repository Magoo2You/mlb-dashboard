# 🚀 Deploying MLB Dashboard to Render Cloud

## Prerequisites
- GitHub repository: `https://github.com/Magoo2You/mlb-dashboard`
- [Render account](https://render.com/register) (free tier available)

---

## Step 1: Create Web Service on Render

1. Go to **https://render.com/dashboard** → **"New +"** → **"Web Service"**
2. Select **"Connect a git repository"**
3. Find your repo: `Magoo2You/mlb-dashboard`

---

## Step 2: Configure Build & Runtime Settings

Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `mlb-dashboard` (or any name you prefer) |
| **Region** | Any (US-East recommended) |
| **Branch** | `master` |
| **Root directory** | *(leave blank)* |
| **Build command** | `npm install && npm run build` |
| **Start command** | `node dist/server.cjs` |
| **Environment variables** | See below |

---

## Step 3: Environment Variables

Add these in Render's **"Environment"** tab:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `auto` (Render will assign) |
| `GEMINI_API_KEY` | `[REDACTED]` or leave blank if not used |
| `APP_URL` | `***` (Render injects this) |

> 💡 **Note**: Since we removed Gemini integration, you can set `GEMINI_API_KEY=` (empty string) or omit it entirely.

---

## Step 4: Deploy

Click **"Create Web Service"** → Render will:
1. Clone your repo
2. Run `npm install && npm run build`
3. Start the bundled server at `dist/server.cjs`

Your app will be live at:  
`https://mlb-dashboard-on-render.com` (auto-generated URL)

---

## Step 5: Configure Domain (Optional)

1. Go to **Settings** → **"Domains"**
2. Add your custom domain (e.g., `dashboard.mlbstats.app`)
3. Update DNS A record at your domain registrar

---

## 🔧 Troubleshooting

### Build fails?
Check Render's **"Build & Deployment Logs"** for errors. Common issues:
- Missing dependencies → Check `package.json` is valid
- TypeScript errors → Run `npm run lint` locally first

### App not starting?
Verify the bundled server path in **"Start Command"**:  
Should be: `node dist/server.cjs`

---

## ✅ Success Criteria

Your app is ready when:
- Build passes (green checkmark)
- Service shows **"Running"** status
- URL returns your MLB scoreboard dashboard

---

**📌 Remember**: Render auto-deploys on every push to `master` branch!
