# C++ IKM Practice Exam

A mobile-friendly C++ practice exam inspired by IKM-style assessments.

This project lets anyone practice C++ fundamentals in a timed exam format, with immediate explanations for every answer and local progress tracking.

---

## Features

- 200+ unique C++17/C++20 questions
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
```text
Cpp-IKM/
│
├── web/ # Web version (React + Vite)
│ ├── public/
│ │ └── question_banks/ # Topic-based C++ question banks
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

1. Questions are authored in JSON question-bank files grouped by C++ topics.
2. A manifest file tracks available banks.
3. A React web app loads the banks and runs the exam in the browser.
4. GitHub Pages serves the built static site from the `gh-pages` branch.

No backend, no database, no login required.

---

## Tech Stack

- React 18
- Vite
- GitHub Pages
- LocalStorage (for progress tracking)
- Plain SVG charts (no charting libraries)

---

## Contributing

Want to add questions, report issues, or support the project?

- See [CONTRIBUTING.md](CONTRIBUTING.md)
- Repo: https://github.com/LarryChiem/Cpp-IKM

---

## License

MIT License.  
Feel free to fork, modify, and reuse.
