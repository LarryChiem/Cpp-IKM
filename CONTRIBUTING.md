# Contributing to Cpp-IKM

Thanks for helping improve this project.

Repo: https://github.com/LarryChiem/Cpp-IKM

## Quick Links

- Star the repo: https://github.com/LarryChiem/Cpp-IKM
- Open issues: https://github.com/LarryChiem/Cpp-IKM/issues
- Report a new issue: https://github.com/LarryChiem/Cpp-IKM/issues/new

## How to Star the Repo

1. Open https://github.com/LarryChiem/Cpp-IKM
2. Click the `Star` button in the top-right of the repo page.

## How to Report an Issue

Please include:
- What happened
- What you expected
- Steps to reproduce
- Screenshots or error logs if available

Use: https://github.com/LarryChiem/Cpp-IKM/issues/new

## How to Add Questions to the Question Bank

Question banks are in:
- `web/public/question_banks/`

You can either:
- Add questions to an existing `questions_*.json` file, or
- Add a new `questions_*.json` file

Then regenerate the manifest so the app loads your bank:

```bash
cd web
npm install
npm run gen:manifest
npm run build
```

The manifest file is:
- `web/public/question_banks/index.json`

## Question Format

Use this shape for each question object:

```json
{
  "id": "cpp-9999",
  "prompt": "Your question text",
  "type": "single",
  "options": [
    { "id": "A", "text": "Option A", "isCorrect": false, "explanation": "Why A is wrong" },
    { "id": "B", "text": "Option B", "isCorrect": true, "explanation": "Why B is correct" }
  ],
  "explanation": "Overall explanation for the question",
  "tags": ["topic-tag"],
  "difficulty": "easy",
  "standard": "C++17"
}
```

Notes:
- `id` must be unique across all banks.
- Use `"type": "single"` for one correct answer and `"type": "multi"` for multiple correct answers.
- Include clear explanations for each option and the overall answer.

## Suggested Contribution Workflow

1. Fork the repo.
2. Create a branch (`feat/add-question-bank`).
3. Add or update questions under `web/public/question_banks/`.
4. Run `npm run gen:manifest` and `npm run build` from `web/`.
5. Commit and push your branch.
6. Open a pull request to `main`.

PRs are welcome for:
- New C++17/C++20 questions
- Better explanations
- Fixes for incorrect answers
- UI/UX improvements
