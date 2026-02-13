# Setup and Deployment Guide

This document explains how the Python3 IKM Practice Exam was built and deployed from scratch.

---

## Prerequisites

- Python 3.9+
- Node.js (LTS recommended)
- npm
- Git
- A GitHub account

---

## Step 1: Python Question Engine

The project began as a CLI-based Python exam engine.

Key features:
- Timed exam
- 54-question limit
- Single and multi-select questions
- Detailed explanations for each option

The questions are defined as Python dataclasses and stored in a `bank()` function.

---

## Step 2: Export Questions to JSON

To reuse the question bank on the web:

- The Python question objects are converted to JSON
- Each question includes:
  - topic
  - prompt
  - options
  - correct indices
  - explanations

This produces:

`web/public/questions.json`


This file is the single source of truth for the web app.

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

- questions.json

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

- To update questions: regenerate questions.json and redeploy

- To reset progress: clear browser localStorage

- CSV export provides a portable record of attempts

---