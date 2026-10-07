# Rutgers GPA Calculator

A small, entirely local GPA calculator built with Vite, React, JavaScript, and Tailwind CSS. Your courses and grades live in a local JSON file that Git deliberately ignores, so they are never committed or pushed.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
cp src/data/personalCourses.template.json src/data/personalCourses.json
npm run dev
```

Open the local URL Vite prints in the terminal. The app saves edits in your browser's localStorage; **Reset to Default Plan** restores the contents of your local JSON file.

To check the production build:

```bash
npm run build
```

## Add your own courses

1. Copy `src/data/personalCourses.template.json` to `src/data/personalCourses.json`.
2. Replace its example entries with your own data.
3. Keep `personalCourses.json` private. It is already listed in `.gitignore`.

The app still runs without that file, but starts with an empty plan. The template remains in the repository so anyone can create their own local plan.

### JSON structure

`personalCourses.json` has two top-level lists:

```json
{
  "courses": [],
  "externalCredits": []
}
```

#### `courses`

Each ordinary or planned course belongs in `courses`.

| Field | Required | What to enter |
| --- | --- | --- |
| `id` | Yes | A unique identifier, such as `fall-2026-198-111`. |
| `semester` | Yes | A display heading such as `Fall 2026`. Semesters are sorted chronologically when their names include a season and year. |
| `code` | No | Your course number, e.g. `01:198:111`. |
| `name` | Yes | Course name. |
| `subtopic` | No | Optional short note shown below the course name. |
| `credits` | Yes | A positive number, including decimals such as `1.5`. |
| `grade` | Yes | `A`, `B+`, `B`, `C+`, `C`, `D`, `F`, `P`, or an empty string. |

Use `"grade": ""` for a course without a posted grade. Empty grades, `P`, and any non-letter grade are completely excluded from GPA credits and grade points. Only `A`, `B+`, `B`, `C+`, `C`, `D`, and `F` count.

Example:

```json
{
  "id": "fall-2026-198-111",
  "semester": "Fall 2026",
  "code": "01:198:111",
  "name": "Example Course",
  "credits": 4,
  "grade": "A"
}
```

#### `externalCredits`

Use `externalCredits` for AP, transfer, or exam credit. These are displayed separately and never affect the GPA. Each entry needs `code`, `name`, and a numeric `credits` value.

```json
{
  "code": "01:000:100",
  "name": "Example Transfer Credit",
  "credits": 3
}
```

## Privacy

Do not rename or remove the `src/data/personalCourses.json` rule in `.gitignore`. Before committing, use `git status` to confirm only the template—not your personal JSON file—is staged.
