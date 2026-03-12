# 🎣 Catfishing Group Tracker

> *"Are we feline good about today's puzzle? Let's find out."*

A no-dependency, single-file web app for tracking your friend group's daily [Catfishing](https://catfishing.net/) scores — and seeing if, as a collective, you've got all 10 questions covered.

---

## What's the catch?

Each day, everyone plays Catfishing and shares their score. It looks something like this:

```
catfishing.net
#626 - 5/10
🐈🐟🐟🐟🐈
🐈🐈🐟🐈🐟
```

- 🐈 = correct (purrfect)
- 🐟 = wrong (you took the bait)
- 🥚 = close un oeuf

This tracker lets you paste everyone's scores, then shows a **Group row** — combining all your answers to see if the group collectively fished up a cat on every question.

---

## Getting started (no setup required, we're not kitten around)

1. Open `catfish-tracker.html` in **Chrome** or **Edge**
2. Click **📂 Open scores.json** and navigate to `scores-history/scores.json`
3. Paste each friend's share text, enter their name, click **Add Score**
4. Scores auto-save directly to the file — commit away!

> **Firefox/Safari?** The auto-save uses Chrome's File System Access API. In unsupported browsers, use the **Import/Export JSON** buttons instead and manually replace `scores.json`.

---

## How the group score works

For each of the 10 questions:

| Situation | Group gets |
|---|---|
| Anyone got a 🐈 | 🐈 — the group reeled it in |
| Nobody got 🐈, but someone got 🥚 | 🥚 — close un oeuf |
| Everyone got 🐟 | 🐟 — one that got away |

The group score counts 🐈 as 1 point and 🥚 as 0.5 — just like the game itself.

---

## File structure

```
catfish-tracker.html        ← open this in your browser
scores-history/
  scores.json               ← all scores, committed to the repo
```

Scores are stored by puzzle number, so every day lives side by side:

```json
{
  "626": [ { "name": "Steph", "score": "5/10", "emojis": ["🐈", "🐟", ...] }, ... ],
  "627": [ ... ]
}
```

---

## Tips

- **Switching days** — use the puzzle dropdown at the top of the Results section
- **Made a mistake?** Hit ✕ next to any score to remove it
- **Nuke a whole day** — use the "Delete day" button (it'll ask first, we're not animals)
- **Browser restart?** The app remembers which file you had open and pre-navigates the picker back to it — one click and you're back in business
- **👑 Crown** — the highest scorer of the day gets a 👑 next to their name (ties share it)
- **🤓 Nerd badge** — if you're the only person who got a particular question right, your name gets a 🤓 next to it

---

*May your group always catch every cat. 🐾*
