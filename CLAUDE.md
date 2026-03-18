# Wisdom of the Masses / Catfish Tracker

## Local Development
Run the app locally using Docker:
```
cd docker && docker compose up
```
App runs on port 3000.

## Deployment
Self-hosted via the `ghcr.io/softwaresteph/wisdom-of-the-masses:latest` image. Users should deploy using the included `docker/docker-compose.yml`.

## Code Style
Follow standard HTML and Node.js formatting practices.

## UI Rules
Always show a confirmation dialog before any destructive action (e.g. deleting a row).

## Branches
Never commit directly to `main`. Always work in a branch named after the commit type:

- `feature/[short-description]`
- `fix/[short-description]`
- `refactor/[short-description]`
- `chore/[short-description]`

## Commits
Keep commit messages concise and descriptive. Use the appropriate prefix based on type:

- `Add [thing]` — new feature or enhancement
- `Fix [what was broken]` — bug fix
- `Refactor [thing]` — code restructuring
- `Update [thing]` — chore, dependency update, config change, etc.

## Pull Requests
Use the appropriate template based on commit type:

**Feature**
```
## Summary
Brief description of what was added.

## Motivation
The use case or reason for the feature.
```

**Bug Fix**
```
## Problem
What was broken and how it manifested.

## Solution
What the fix was and why it works.
```

**Refactor**
```
## Changes
What was restructured or reorganized.

## Motivation
The reason (readability, maintainability, etc.).
```

**Chore**
Plain description, no headings needed.

If the PR resolves a GitHub issue, include `Closes #[issue number]` at the bottom of the PR body.
