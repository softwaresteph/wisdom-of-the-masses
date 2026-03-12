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

## Self-hosted Docker setup

Tired of being the one who has to collect everyone's scores? Run the tracker as a server and let your friends enter their own — no file juggling, no copy-pasting, just paste and go.

### Prerequisites

- Docker with the Compose plugin
- A machine accessible on your network (or via a reverse proxy / Cloudflare Tunnel)

### Quick start

1. Download the compose file:
   ```bash
   curl -O https://raw.githubusercontent.com/softwaresteph/wisdom-of-the-masses/main/docker/docker-compose.yml
   ```

2. Start the container:
   ```bash
   docker compose up -d
   ```

3. Open `http://localhost:3000` — the file bar will show **⚡ Server storage**.

Scores are written to a named Docker volume (`catfish-data`) and survive container restarts.

### Configuration

Set environment variables in the compose file to customise the deployment:

| Variable | Default | Description |
|---|---|---|
| `APP_PATH` | *(empty)* | Subpath the app is served at — set this if your reverse proxy forwards a subpath (e.g. `/catfish-tracker`) |
| `PORT` | `3000` | Port the server listens on inside the container |

### Updating

```bash
docker compose down && docker compose up -d
```

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
