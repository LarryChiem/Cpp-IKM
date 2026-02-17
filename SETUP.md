# Setup and Deployment Guide

This document explains how the C++ IKM Practice Exam is built and deployed.

---

## Prerequisites

- Node.js (LTS recommended)
- npm
- Git
- A GitHub account

---

## Step 1: Prepare the C++ Question Banks

The project uses JSON-based C++ question banks grouped by topic.

Current structure:
- `web/public/question_banks/*.json` for questions
- `web/public/question_banks/index.json` for the bank manifest

Each question entry includes:
- `id`
- `prompt`
- `type`
- `options`
- `explanation`
- `tags`
- `difficulty`
- `standard`

---

## Step 3: Create the Web App

The web app uses React + Vite.

From the repository root:

```bash
cd web
npm install
npm run dev
```

This starts a local development server.

Core behaviors implemented in the browser:

- Randomized question order

- 135-minute countdown timer

- Answer validation

- Explanation rendering

- Attempt history saved to localStorage

- CSV export of results

## Step 4: Build for Production

Before deploying, the app must be built:

`npm run build`


This creates a dist/ folder containing static files:

- index.html

- assets/

- question bank JSON files

## Step 5: Deploy to GitHub Pages

Deployment uses the `gh-pages` package.

#### package.json scripts
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```
#### Deploy command
```bash 
npm run deploy
```

This:

- Creates or updates the gh-pages branch

- Pushes the contents of dist/ to the branch root

### Step 6: Configure GitHub Pages

In the GitHub repository:

1. Go to Settings → Pages

2. Set:

   - Source: Deploy from a branch

   - Branch: gh-pages

   - Folder: /(root)

3. Save

If you encounter a 404:

- Toggle the source to another option

- Save

- Toggle back to gh-pages /(root)

- Save again

This forces GitHub Pages to rebind the deployment.

--- 

### Common Issues and Fixes
#### 404 after deploy

Cause: Pages pointing to the wrong branch or folder.


Fix:

- Ensure index.html exists at the root of gh-pages

- Re-save Pages settings

### dist folder missing

Cause: Running deploy without building.

Fix:

```bash
npm run build
npm run deploy
```

#### Assets not loading

Fix:
Create a .nojekyll file inside dist/ before deploying.

```bash
touch dist/.nojekyll
npm run deploy
```
---
### Why GitHub Pages

- Free

- No backend required

- Works well with static React builds

- Easy to share publicly

---
### Next Steps (Planned)

- Convert site into a PWA (installable on mobile)

- Wrap PWA into an Android app using Capacitor or Trusted Web Activity

- Optional offline support

- Optional exam vs practice modes

Maintenance Notes

- To update questions: edit `web/public/question_banks/*.json` and redeploy
- If banks are added/removed, regenerate `web/public/question_banks/index.json`:
  - `cd web && node scripts/generate-questions-manifest.mjs`

- To reset progress: clear browser localStorage

- CSV export provides a portable record of attempts

---
