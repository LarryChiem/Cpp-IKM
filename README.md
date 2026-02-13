# Python3 IKM Practice Exam

A mobile-friendly Python 3 practice exam inspired by IKM-style assessments.

This project lets anyone practice Python fundamentals in a timed exam format, with immediate explanations for every answer and local progress tracking.

Live site:  
https://larrychiem.github.io/Python3_IKM/

---

## Features

- 54 unique Python 3 questions
- 135-minute timed exam mode
- Single-select and multi-select questions
- Immediate explanations for why each option is right or wrong
- Progress tracking stored locally in the browser
- Score history visualization
- CSV export of attempt history
- Mobile-friendly UI
- Hosted for free via GitHub Pages

---

## Project Structure
```
Python3_IKM/
│
├── ikm_python_practice.py # Original CLI-based Python exam engine
│
├── web/ # Web version (React + Vite)
│ ├── public/
│ │ └── questions.json # Question bank (exported from Python)
│ ├── src/
│ │ ├── App.jsx # Main quiz logic and UI
│ │ ├── main.jsx # React entry point
│ │ └── index.css # Styling
│ ├── index.html
│ ├── vite.config.js
│ ├── package.json
│ └── README.md
│
├── README.md # You are here
└── SETUP.md # Full setup and deployment guide
```


---

## How It Works (High Level)

1. Questions are authored in Python as structured objects.
2. The question bank is exported to JSON.
3. A React web app loads the JSON and runs the exam in the browser.
4. GitHub Pages serves the built static site from the `gh-pages` branch.

No backend, no database, no login required.

---

## Tech Stack

- Python 3 (question authoring, CLI engine)
- React 18
- Vite
- GitHub Pages
- LocalStorage (for progress tracking)
- Plain SVG charts (no charting libraries)

---

## License

MIT License.  
Feel free to fork, modify, and reuse.
