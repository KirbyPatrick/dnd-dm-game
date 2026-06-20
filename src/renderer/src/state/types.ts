export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export type AbilityScores = Record<AbilityKey, number>

export const ABILITY_KEYS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

export const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma'
}

export interface Item {
  name: string
  note?: string
  qty?: number
}

export interface Relationship {
  name: string // who: a party member or key NPC
  status: string // current standing / description
}

export interface Feature {
  name: string // spell or class ability
  note?: string
}

/** Deeper sheet detail shown in the card modal; the DM fills these over play. */
export interface CharSheet {
  ac?: number
  subclass?: string // chosen at level 3; set by the DM when the player picks
  inventory?: Item[]
  bond?: string
  flaw?: string
  trait?: string
  relationships?: Relationship[]
  moments?: string[] // notable moments
  spellSlots?: string // free-form, e.g. "1st 3/4 · 2nd 1/2"
  features?: Feature[] // class abilities & known spells
}

export interface Character extends CharSheet {
  name: string
  gender?: string
  raceName: string
  className: string
  level: number
  hp: number
  maxHp: number
  abilities: AbilityScores
  conditions?: string[]
  backstory?: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

/** An active foe the DM is tracking, rendered as a sprite card. */
export interface Enemy {
  name: string
  kind: string // sprite key, see data/sprites.ts
  hp: number
  maxHp: number
  distance: number // feet from the hero
  ac?: number
  abilities?: Partial<AbilityScores>
  conditions?: string[]
}

/** An allied companion travelling with the hero, rendered as a sprite card. */
export type PartyStatus = 'active' | 'camp'

export interface PartyMember extends CharSheet {
  name: string
  gender?: string
  className: string
  kind: string // sprite key (class-based), see data/sprites.ts
  level?: number
  hp: number
  maxHp: number
  distance: number // feet from the hero
  abilities?: Partial<AbilityScores>
  conditions?: string[]
  status?: PartyStatus // active (in the field) or waiting at camp
}

export type BackstoryMode = 'active' | 'flavor'

/** A roll the player must make; surfaced as an animated dice widget. */
export interface RollRequest {
  who: string
  kind: 'ability' | 'save' | 'attack' | 'initiative' | 'custom'
  label: string
  ability?: AbilityKey
  dc?: number
  proficient?: boolean
  modifier?: number // explicit modifier from the DM; overrides computed
}

export interface Combatant {
  name: string
  init: number
  side: 'party' | 'enemy'
}

export interface CombatState {
  active: boolean
  round?: number
  turn?: string // name of the combatant whose turn it is
  order: Combatant[]
}

export interface SavedGame {
  character: Character
  messages: Message[]
  enemies?: Enemy[]
  party?: PartyMember[]
  backstoryMode?: BackstoryMode
  xp?: number
  combat?: CombatState | null
  createdAt: string
}

// ---- XP & leveling (5e standard thresholds) ----
export const XP_THRESHOLDS = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000,
  165000, 195000, 225000, 265000, 305000, 355000
]

export function levelFromXp(xp: number): number {
  let lvl = 1
  for (let i = 0; i < XP_THRESHOLDS.length; i++) if (xp >= XP_THRESHOLDS[i]) lvl = i + 1
  return lvl
}

export function xpForLevel(level: number): number {
  return XP_THRESHOLDS[Math.max(0, Math.min(XP_THRESHOLDS.length - 1, level - 1))]
}

export function proficiencyBonus(level: number): number {
  return 2 + Math.floor((Math.max(1, level) - 1) / 4)
}

// The DM appends current game state as fenced JSON blocks (```enemies / ```party /
// ```hero). We parse them out of the reply and strip them from the visible prose.
const ENEMY_BLOCK = /```enemies\s*([\s\S]*?)```/i
const PARTY_BLOCK = /```party\s*([\s\S]*?)```/i
const HERO_BLOCK = /```hero\s*([\s\S]*?)```/i
const ROLL_BLOCK = /```roll\s*([\s\S]*?)```/i
const COMBAT_BLOCK = /```combat\s*([\s\S]*?)```/i
const PROGRESS_BLOCK = /```progress\s*([\s\S]*?)```/i

function normItem(it: unknown): Item | null {
  if (typeof it === 'string') return { name: it }
  if (it && typeof it === 'object' && typeof (it as Item).name === 'string') {
    const o = it as Item
    return { name: o.name, note: o.note ? String(o.note) : undefined, qty: o.qty }
  }
  return null
}

function normRel(r: unknown): Relationship | null {
  if (typeof r === 'string') return { name: r, status: '' }
  if (r && typeof r === 'object' && typeof (r as Relationship).name === 'string') {
    const o = r as Relationship
    return { name: o.name, status: o.status ? String(o.status) : '' }
  }
  return null
}

function normFeature(f: unknown): Feature | null {
  if (typeof f === 'string') return { name: f }
  if (f && typeof f === 'object' && typeof (f as Feature).name === 'string') {
    const o = f as Feature
    return { name: o.name, note: o.note ? String(o.note) : undefined }
  }
  return null
}

/** Shared optional sheet/state fields used by hero, party and enemy blocks. */
export interface SheetUpdate extends CharSheet {
  hp?: number
  maxHp?: number
  level?: number
  conditions?: string[]
  abilities?: Partial<AbilityScores>
}

function readSheet(raw: Record<string, unknown>): SheetUpdate {
  const out: SheetUpdate = {}
  if (raw.ac !== undefined) out.ac = Math.max(0, Number(raw.ac) || 0)
  if (typeof raw.subclass === 'string') out.subclass = raw.subclass
  if (raw.hp !== undefined) out.hp = Math.max(0, Number(raw.hp) || 0)
  if (raw.maxHp !== undefined) out.maxHp = Math.max(1, Number(raw.maxHp) || 1)
  if (raw.level !== undefined) out.level = Math.max(1, Number(raw.level) || 1)
  if (Array.isArray(raw.conditions)) out.conditions = raw.conditions.map(String)
  if (raw.abilities && typeof raw.abilities === 'object') {
    const src = raw.abilities as Record<string, unknown>
    const ab: Partial<AbilityScores> = {}
    for (const k of ABILITY_KEYS) if (src[k] !== undefined) ab[k] = Number(src[k]) || 0
    if (Object.keys(ab).length) out.abilities = ab
  }
  if (Array.isArray(raw.inventory)) out.inventory = raw.inventory.map(normItem).filter(isItem)
  if (typeof raw.bond === 'string') out.bond = raw.bond
  if (typeof raw.flaw === 'string') out.flaw = raw.flaw
  if (typeof raw.trait === 'string') out.trait = raw.trait
  if (Array.isArray(raw.relationships)) out.relationships = raw.relationships.map(normRel).filter(isRel)
  if (Array.isArray(raw.moments)) out.moments = raw.moments.map(String)
  if (typeof raw.spellSlots === 'string') out.spellSlots = raw.spellSlots
  const feats = Array.isArray(raw.features) ? raw.features : Array.isArray(raw.spells) ? raw.spells : null
  if (feats) out.features = feats.map(normFeature).filter(isFeature)
  return out
}

const isItem = (x: Item | null): x is Item => x !== null
const isRel = (x: Relationship | null): x is Relationship => x !== null
const isFeature = (x: Feature | null): x is Feature => x !== null

export interface HeroUpdate extends SheetUpdate {
  gender?: string
}

export function parseHero(text: string): HeroUpdate | null {
  const m = text.match(HERO_BLOCK)
  if (!m) return null
  try {
    const raw = JSON.parse(m[1].trim())
    if (!raw || typeof raw !== 'object') return null
    const out: HeroUpdate = readSheet(raw)
    if (typeof raw.gender === 'string') out.gender = raw.gender
    return out
  } catch {
    return null
  }
}

export interface PartyUpdate extends SheetUpdate {
  name: string
  className?: string
  kind?: string
  gender?: string
  distance?: number
  status?: PartyStatus
  remove?: boolean // explicit removal (death / permanent departure)
}

export function parseParty(text: string): PartyUpdate[] | null {
  const m = text.match(PARTY_BLOCK)
  if (!m) return null
  try {
    const raw = JSON.parse(m[1].trim())
    if (!Array.isArray(raw)) return null
    return raw
      .filter((p) => p && typeof p.name === 'string')
      .map((p) => {
        const out: PartyUpdate = { name: String(p.name), ...readSheet(p) }
        if (typeof p.class === 'string') out.className = p.class
        else if (typeof p.className === 'string') out.className = p.className
        if (typeof p.kind === 'string') out.kind = p.kind
        if (typeof p.gender === 'string') out.gender = p.gender
        if (p.status === 'active' || p.status === 'camp') out.status = p.status
        // Treat death/departure markers as explicit removal.
        if (p.remove === true || ['gone', 'dead', 'left', 'removed'].includes(p.status))
          out.remove = true
        if (p.distance !== undefined) out.distance = Math.max(0, Number(p.distance) || 0)
        return out
      })
  } catch {
    return null
  }
}

export function parseRoll(text: string): RollRequest | null {
  const m = text.match(ROLL_BLOCK)
  if (!m) return null
  try {
    const r = JSON.parse(m[1].trim())
    if (!r || typeof r !== 'object' || typeof r.label !== 'string') return null
    const kinds = ['ability', 'save', 'attack', 'initiative', 'custom']
    return {
      who: typeof r.who === 'string' ? r.who : 'Hero',
      kind: kinds.includes(r.kind) ? r.kind : 'custom',
      label: r.label,
      ability: ABILITY_KEYS.includes(r.ability) ? r.ability : undefined,
      dc: r.dc !== undefined ? Number(r.dc) : undefined,
      proficient: !!r.proficient,
      modifier: r.modifier !== undefined ? Number(r.modifier) : undefined
    }
  } catch {
    return null
  }
}

export function parseCombat(text: string): CombatState | null {
  const m = text.match(COMBAT_BLOCK)
  if (!m) return null
  try {
    const c = JSON.parse(m[1].trim())
    if (!c || typeof c !== 'object') return null
    const order: Combatant[] = Array.isArray(c.order)
      ? c.order
          .filter((o: unknown) => o && typeof (o as Combatant).name === 'string')
          .map((o: Combatant) => ({
            name: String(o.name),
            init: Number(o.init) || 0,
            side: o.side === 'enemy' ? 'enemy' : 'party'
          }))
      : []
    return {
      active: c.active !== false && order.length > 0,
      round: c.round !== undefined ? Number(c.round) : undefined,
      turn: typeof c.turn === 'string' ? c.turn : undefined,
      order
    }
  } catch {
    return null
  }
}

export function parseProgress(text: string): number | null {
  const m = text.match(PROGRESS_BLOCK)
  if (!m) return null
  try {
    const p = JSON.parse(m[1].trim())
    if (p && typeof p === 'object' && p.xp !== undefined) return Math.max(0, Number(p.xp) || 0)
    return null
  } catch {
    return null
  }
}

export function parseEnemies(text: string): Enemy[] | null {
  const m = text.match(ENEMY_BLOCK)
  if (!m) return null
  try {
    const raw = JSON.parse(m[1].trim())
    if (!Array.isArray(raw)) return null
    return raw
      .filter((e) => e && typeof e.name === 'string')
      .map((e) => {
        const sheet = readSheet(e)
        return {
          name: String(e.name),
          kind: typeof e.kind === 'string' ? e.kind : 'default',
          maxHp: Math.max(1, Number(e.maxHp) || 1),
          hp: Math.max(0, Number(e.hp) || 0),
          distance: Math.max(0, Number(e.distance) || 0),
          ac: sheet.ac,
          abilities: sheet.abilities,
          conditions: sheet.conditions
        }
      })
  } catch {
    return null
  }
}

const ALL_BLOCKS = [ENEMY_BLOCK, PARTY_BLOCK, HERO_BLOCK, ROLL_BLOCK, COMBAT_BLOCK, PROGRESS_BLOCK]
const ALL_FENCES = ['```enemies', '```party', '```hero', '```roll', '```combat', '```progress']

/** Remove the complete state blocks from finished narration. */
export function stripGameBlocks(text: string): string {
  let out = text
  for (const re of ALL_BLOCKS) out = out.replace(re, '')
  return out.trimEnd()
}

/** Remove possibly-incomplete blocks while text is still streaming in. */
export function stripGameBlocksLive(text: string): string {
  const fences = ALL_FENCES.map((f) => text.indexOf(f)).filter((i) => i !== -1)
  if (fences.length === 0) return text
  return text.slice(0, Math.min(...fences)).trimEnd()
}

export function distanceLabel(feet: number): string {
  if (feet <= 5) return 'Adjacent'
  if (feet <= 15) return `${feet} ft · near`
  if (feet <= 30) return `${feet} ft`
  return `${feet} ft · far`
}

/** D&D ability modifier: floor((score - 10) / 2). */
export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function formatMod(score: number): string {
  const m = abilityMod(score)
  return m >= 0 ? `+${m}` : `${m}`
}
