# Python Practice Exam (Web)

Mobile-friendly website (React + Vite) that loads your question bank from `public/questions.json`.

## Local run

1) Install Node.js (LTS)
2) In this `web/` folder:

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

From `web/`:

```bash
npm run deploy
```

Then in GitHub:
Settings → Pages → Source: `gh-pages` branch

Notes:
- `vite.config.js` uses `base: './'` so it works on GitHub Pages under a repo subpath.
- Progress history uses localStorage; you can export CSV.
