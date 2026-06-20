# Dungeon Master — an AI-run Curse of Strahd adventure

A desktop role-playing game where **Claude is your Dungeon Master**, running a solo, text-based
campaign set in Barovia (the gothic-horror realm of D&D's *Curse of Strahd*). Build a hero and a
party, roll your own dice, fight in initiative order, level up, and explore a reactive world narrated
in real time by a large language model.

> Built with TypeScript, React 19, and Electron. The AI is driven through a structured
> "state-block" protocol so the model's narration and the game's UI stay in sync.

---

## Highlights

- **AI Dungeon Master** — Claude narrates the world, voices NPCs and companions, adjudicates actions,
  and tracks consequences. The system prompt is informed by Matt Colville's *Running the Game*
  (verisimilitude, fail-forward, roll-before-outcome, no looping) and lives in [`CLAUDE.md`](./CLAUDE.md).
- **Structured state protocol** — the model emits hidden fenced-JSON blocks (`hero`, `party`,
  `enemies`, `combat`, `roll`, `progress`) that the app parses and renders as live UI. The narration
  the player sees is always kept separate from the machine-readable state.
- **Player-rolled dice** — when the hero must make a check, save, attack, or initiative roll, the DM
  requests a roll and waits; the player rolls an animated d20 (modifier computed from ability scores
  and proficiency) and the result is fed back for the DM to narrate.
- **Character & party creation** — choose from the 2024 PHB's 10 species and 12 classes, roll ability
  scores with animated dice, write a backstory (used actively or as flavor, your choice), and build a
  party of companions the DM plays as fully present characters.
- **Tactical combat** — a 5e-style initiative tracker shows the full turn order and highlights whose
  turn it is.
- **Progression** — shared party XP with a single progress bar; on level-up the app deterministically
  applies HP, proficiency, class features, and spell slots, then shows a summary card.
- **Clickable character cards** — hero, party, and enemy sprite cards open a tabbed sheet
  (Stats / Inventory / Relationships / Spells & Abilities).
- **Hand-drawn pixel-art sprites** — gothic-horror roster (Strahd, vampire spawn, werewolves,
  wraiths, Vistani, Barovian villagers, ravens…) rendered as crisp scalable SVG.

_Screenshots coming soon — clone and run locally to see it in motion._

---

## Tech stack

| Area        | Choice                                              |
| ----------- | --------------------------------------------------- |
| Language    | TypeScript (strict)                                 |
| UI          | React 19                                            |
| Desktop     | Electron + electron-vite                            |
| AI          | Anthropic Claude (`@anthropic-ai/sdk`)              |
| Persistence | `electron-store`                                    |
| Build       | Vite                                                |

## Architecture

```
src/
  main/        Electron main process — owns the Claude client & API key, builds
               the DM system prompt, exposes IPC handlers. The key is loaded from
               .env here and is NEVER exposed to the renderer.
  preload/     contextBridge — a minimal, typed `window.api` surface (no Node access).
  renderer/    React app
    state/     game state, the DM state-block parsers, the turn loop (useGame)
    data/      species, classes, class features, progression tables, sprites
    components/ game view, character sheet, modals, dice, initiative tracker…
```

Design notes worth calling out:

- **Security boundary.** The Anthropic API key lives only in the Electron main process and is read
  from a git-ignored `.env`. The renderer talks to it through a narrow `contextBridge` API and never
  sees the key.
- **AI ↔ UI contract.** Rather than scraping prose, the DM writes typed JSON state blocks that are
  parsed, validated, and merged into React state. The model is the rules authority for narrative and
  open-ended adjudication; the client owns the deterministic, must-be-correct parts (XP→level
  thresholds, proficiency, HP and class-feature application on level-up).

## Running locally

Requires Node 18+ and an [Anthropic API key](https://console.anthropic.com/).

```bash
npm install
cp .env.example .env        # then add your ANTHROPIC_API_KEY
npm run dev                 # launch the app
```

Other scripts: `npm run build` (production build), `npm run typecheck`.

## License

[MIT](./LICENSE)

---

_Personal project exploring LLM-driven game design — using a structured protocol to make a language
model a reliable game engine, not just a chatbot._
