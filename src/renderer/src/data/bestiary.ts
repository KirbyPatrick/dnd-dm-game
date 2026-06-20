import data from './monsters.json'
import type { AbilityScores } from '@renderer/state/types'

// Curse of Strahd bestiary — the authoritative source of truth for monster
// mechanics. We keep the full file on disk and inject it into the DM prompt
// LEANLY: a one-line index of every creature always, plus the full stat block
// only for creatures currently in the scene.
export interface Monster {
  name: string
  tier?: string
  type?: string
  cr?: number
  xp?: number
  ac?: number
  hp?: number
  abilities?: Partial<AbilityScores>
  [key: string]: unknown
}

const CREATURES: Monster[] = ((data as { creatures?: Monster[] }).creatures ?? []).slice()

const norm = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/** One compact line per creature — always sent so the DM knows the roster. */
export function bestiaryIndex(): string {
  return CREATURES.map(
    (m) =>
      `- ${m.name} (${m.tier ?? '?'}, CR ${m.cr ?? '?'}) — AC ${m.ac ?? '?'}, HP ${m.hp ?? '?'}, ${
        m.xp ?? '?'
      } XP`
  ).join('\n')
}

/** Best-effort match of an enemy's name/kind to a canonical creature. */
export function findMonster(query: string): Monster | undefined {
  if (!query) return undefined
  const q = norm(query)
  return (
    CREATURES.find((m) => norm(m.name) === q) ??
    CREATURES.find((m) => norm(m.name).startsWith(q) || q.startsWith(norm(m.name))) ??
    (q.length >= 5 ? CREATURES.find((m) => norm(m.name).includes(q)) : undefined)
  )
}

/** Full stat blocks (as compact JSON) for the named creatures, de-duplicated. */
export function statBlocksFor(names: string[]): string {
  const seen = new Set<string>()
  const blocks: string[] = []
  for (const name of names) {
    const m = findMonster(name)
    if (m && !seen.has(m.name)) {
      seen.add(m.name)
      blocks.push(JSON.stringify(m))
    }
  }
  return blocks.join('\n')
}
