# Control Tower

Learning operations dashboard for POWER Customer Service. Manages agents, skills, training timelines, and skill-matrix coverage.

**Tech stack:** React (Vite) + Firebase (Firestore + Hosting) + GitHub Actions

---

## 📋 Setup Guide — Step by Step

Follow these steps in order. Estimated time: **30–45 minutes**.

### Step 1 — Create Firebase Project

1. Go to <https://console.firebase.google.com>
2. Click **Add project** → name it something like `control-tower-power`
3. Disable Google Analytics (not needed)
4. Wait for project creation to finish

### Step 2 — Enable Firestore

1. In Firebase Console, go to **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we'll deploy our own rules)
4. Pick location: **eur3 (Europe, multi-region)** — closest to Denmark
5. Click **Enable**

### Step 3 — Create Web App & Get Config

1. In Firebase Console, click the gear icon → **Project settings**
2. Scroll to **Your apps** → click the `</>` (web) icon
3. Nickname: `control-tower-web`
4. **Do NOT** check "Also set up Firebase Hosting" (we'll do it via CLI)
5. Click **Register app**
6. Copy the `firebaseConfig` object — you'll need these values

### Step 4 — Clone to GitHub

```bash
# Push this project folder to a new GitHub repo
cd control-tower
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub (e.g. via https://github.com/new), then:
git remote add origin https://github.com/YOUR-USERNAME/control-tower.git
git branch -M main
git push -u origin main
```

### Step 5 — Install Firebase CLI Locally

```bash
npm install -g firebase-tools
firebase login
```

### Step 6 — Configure Your Project ID

Edit `.firebaserc` and replace `YOUR-FIREBASE-PROJECT-ID` with your actual project ID from Step 1.

### Step 7 — Create Local Environment File

```bash
cp .env.example .env.local
```

Then open `.env.local` and paste the values from Step 3's `firebaseConfig`:

```
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=control-tower-power.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=control-tower-power
...
```

### Step 8 — Install Dependencies

```bash
npm install
```

### Step 9 — Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Step 10 — Seed Initial Data

This creates the 8 skills and one admin user:

```bash
node scripts/seed.js
```

Default admin login after seed:
- **Username:** `admin`
- **PIN:** `123456`

⚠️ **Change this PIN immediately** by logging in, going to Admin, deleting the default admin, and creating a new one.

### Step 11 — Test Locally

```bash
npm run dev
```

Open <http://localhost:5173>. Log in with `admin` / `123456`. Add some agents, assign skills.

### Step 12 — Enable Firebase Hosting

```bash
firebase init hosting
```

When prompted:
- Use an existing project → pick your project
- Public directory: `dist`
- Single-page app: `Yes`
- Set up automatic builds with GitHub: `No` (we have our own workflow)
- Overwrite `index.html`: `No`

### Step 13 — First Manual Deploy

```bash
npm run build
firebase deploy --only hosting
```

Your app is now live at `https://YOUR-PROJECT-ID.web.app` 🎉

### Step 14 — Set Up GitHub Actions Auto-Deploy

#### 14a. Generate Firebase service account

```bash
firebase init hosting:github
```

- Answer yes to "Set up automatic deployment"
- Pick your repo: `YOUR-USERNAME/control-tower`
- When asked about build scripts, skip (our workflow handles it)
- This will automatically add `FIREBASE_SERVICE_ACCOUNT` secret to your repo

#### 14b. Add environment variables as GitHub secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions** → **New repository secret**

Add each of these (same values as `.env.local`):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

#### 14c. Remove auto-generated workflow (if any)

Firebase's `init hosting:github` may create its own workflow in `.github/workflows/`. Delete that file and keep only `deploy.yml` (ours).

#### 14d. Push to trigger deploy

```bash
git add .
git commit -m "Setup GitHub Actions"
git push
```

Go to your GitHub repo → **Actions** tab and watch it deploy.

---

## 📂 Project Structure

```
control-tower/
├── .github/workflows/deploy.yml    # Auto-deploy on push to main
├── public/
│   └── favicon.svg
├── scripts/
│   └── seed.js                     # Initial data seed script
├── src/
│   ├── lib/
│   │   ├── firebase.js             # Firebase init
│   │   ├── auth.js                 # PIN-based auth
│   │   └── data.js                 # Firestore CRUD operations
│   ├── App.jsx                     # All UI components
│   └── main.jsx                    # React entry point
├── .env.example                    # Env var template
├── .firebaserc                     # Firebase project alias
├── firebase.json                   # Firebase config
├── firestore.rules                 # Security rules
├── index.html
├── package.json
└── vite.config.js
```

---

## 🗄️ Firestore Data Model

```
/skills/{skillId}
  - name: string
  - description: string
  - targetVolumePct: number (0-100)
  - order: number

/agents/{agentId}
  - name: string
  - market: 'DK' | 'NO' | 'SE' | 'FI'
  - startDate: string (YYYY-MM-DD)
  - status: 'Active' | 'Onboarding'
  - skills: string[] (skill IDs)
  - onboardingComplete: boolean

/agents/{agentId}/timeline/{eventId}
  - date: string (YYYY-MM-DD)
  - type: 'onboarding' | 'skill' | 'training' | 'comment'
  - title: string
  - note: string
  - createdAt: timestamp

/users/{userId}
  - username: string (unique)
  - displayName: string
  - pinHash: string (SHA-256)
  - role: 'admin' | 'reader'
```

---

## 🔒 Security Considerations

### PIN-based auth is for internal use only

The current setup uses 6-digit PINs hashed with SHA-256. This is acceptable for:
- ✅ Small internal teams (trainers + readers)
- ✅ Non-sensitive learning data
- ✅ Firma-netværk use

It is **not** acceptable for:
- ❌ Public-facing deployments
- ❌ Handling personally identifiable information beyond names/markets
- ❌ Anything that requires strong auth guarantees

### Hardening path

The current `firestore.rules` are permissive (`allow write: if true`) because we have no Firebase Auth identity on the client. To harden:

1. **Switch to Microsoft 365 SSO** — since POWER already uses Microsoft 365, add `firebase/auth` with MicrosoftAuthProvider. Then rules become:
   ```
   allow write: if request.auth != null && 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
   ```
2. **Or use Cloud Functions** for all writes — client calls a function, function verifies admin PIN server-side, then writes to Firestore. Firestore rules become `allow write: if false` (only service account can write).

### Things to rotate
- Change default admin PIN immediately after first login
- Rotate `FIREBASE_SERVICE_ACCOUNT` secret in GitHub annually
- Review `/users` collection periodically

---

## 🛠️ Commands

```bash
npm run dev         # Local dev server
npm run build       # Production build
npm run preview     # Preview production build locally
npm run deploy      # Build + deploy to Firebase
node scripts/seed.js  # Seed initial data
```

---

## 💰 Firebase Cost Estimate

Stays within **Spark plan (free)** for typical usage:
- Firestore: 50k reads/day, 20k writes/day, 1 GiB storage — free
- Hosting: 10 GB bandwidth/month — free

For ~50 agents, 10 trainers, daily use: you will not exceed free tier.

---

## 🚀 Roadmap (future iterations)

Things not in this MVP but easy to add:
- **Microsoft 365 SSO** — replace PIN auth (see Security Hardening)
- **Bridge to Academy** — link certificate docs per skill per agent
- **Trainer capacity view** — "Who is training what this week"
- **Assign new training task flow** — from the Concepts/Routines section
- **Market-specific targets** — different volume distributions per country
- **Export to CSV/Excel** — for reporting outside the tool
- **Audit log** — separate from timeline, tracks who did what when

---

## 📞 Support

Pull requests and feedback welcome. For internal POWER questions, contact the Learning team.
