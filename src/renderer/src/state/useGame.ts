import { useCallback, useEffect, useState } from 'react'
import { statsForClass } from '@renderer/data/partyStats'
import { gainsBetween, hpPerLevel } from '@renderer/data/progression'
import { bestiaryIndex, findMonster, statBlocksFor } from '@renderer/data/bestiary'
import {
  abilityMod,
  levelFromXp,
  parseCombat,
  parseEnemies,
  parseHero,
  parseParty,
  parseProgress,
  parseRoll,
  proficiencyBonus,
  type BackstoryMode,
  type Character,
  type CombatState,
  type Enemy,
  type Feature,
  type HeroUpdate,
  type Message,
  type PartyMember,
  type PartyUpdate,
  type RollRequest,
  type SavedGame
} from './types'

export interface MemberLevelUp {
  name: string
  className: string
  hpGain: number
  newMaxHp: number
  newFeatures: string[]
  spellSlots?: string
}

export interface LevelUpSummary {
  fromLevel: number
  toLevel: number
  proficiency: number
  members: MemberLevelUp[]
}

function dedupeAppend(existing: Feature[] = [], add: Feature[]): Feature[] {
  const names = new Set(existing.map((f) => f.name))
  const out = [...existing]
  for (const f of add) if (!names.has(f.name)) out.push(f)
  return out
}

function conMod(abilities?: Partial<Record<'con', number>> & Record<string, number | undefined>): number {
  const con = abilities?.con
  return con !== undefined ? abilityMod(con) : 0
}

// Deterministic mechanical level-up applied client-side (HP, proficiency,
// standard class features, spell-slot counts). Returns updated sheets + summary.
function applyLevelUp(
  char: Character,
  party: PartyMember[],
  fromLevel: number,
  toLevel: number
): { character: Character; party: PartyMember[]; summary: LevelUpSummary } {
  const prof = proficiencyBonus(toLevel)
  const span = toLevel - fromLevel
  const members: MemberLevelUp[] = []

  const heroGains = gainsBetween(char.className, fromLevel, toLevel)
  const heroHpGain = Math.max(span, (hpPerLevel(char.className) + conMod(char.abilities)) * span)
  const newChar: Character = {
    ...char,
    level: toLevel,
    maxHp: char.maxHp + heroHpGain,
    hp: char.hp + heroHpGain,
    features: dedupeAppend(char.features, heroGains.features),
    spellSlots: heroGains.spellSlots ?? char.spellSlots
  }
  members.push({
    name: char.name,
    className: char.className,
    hpGain: heroHpGain,
    newMaxHp: newChar.maxHp,
    newFeatures: heroGains.features.map((f) => f.name),
    spellSlots: heroGains.spellSlots
  })

  const newParty = party.map((m) => {
    const cls = m.kind || m.className
    const gains = gainsBetween(cls, fromLevel, toLevel)
    const hpGain = Math.max(span, (hpPerLevel(cls) + conMod(m.abilities)) * span)
    members.push({
      name: m.name,
      className: m.className,
      hpGain,
      newMaxHp: m.maxHp + hpGain,
      newFeatures: gains.features.map((f) => f.name),
      spellSlots: gains.spellSlots
    })
    return {
      ...m,
      level: toLevel,
      maxHp: m.maxHp + hpGain,
      hp: m.hp + hpGain,
      features: dedupeAppend(m.features, gains.features),
      spellSlots: gains.spellSlots ?? m.spellSlots
    }
  })

  return {
    character: newChar,
    party: newParty,
    summary: { fromLevel, toLevel, proficiency: prof, members }
  }
}

export type Phase = 'menu' | 'creation' | 'playing'

export const MAX_ACTIVE_COMPANIONS = 4 // player + 4 = 5 active

// Hidden first turn that prompts the DM to set the scene. We don't render it.
export const OPENING_PROMPT =
  '[Begin the adventure. Establish the setting and present the opening scene and hook.]'

function mergeHero(char: Character, u: HeroUpdate): Character {
  const maxHp = u.maxHp ?? char.maxHp
  return {
    ...char,
    gender: u.gender ?? char.gender,
    level: u.level ?? char.level,
    maxHp,
    hp: u.hp !== undefined ? Math.min(u.hp, maxHp) : char.hp,
    abilities: u.abilities ? { ...char.abilities, ...u.abilities } : char.abilities,
    conditions: u.conditions ?? char.conditions,
    ac: u.ac ?? char.ac,
    inventory: u.inventory ?? char.inventory,
    bond: u.bond ?? char.bond,
    flaw: u.flaw ?? char.flaw,
    trait: u.trait ?? char.trait,
    relationships: u.relationships ?? char.relationships,
    moments: u.moments ?? char.moments,
    spellSlots: u.spellSlots ?? char.spellSlots,
    features: u.features ?? char.features
  }
}

// Fill any class-derived detail (stats, AC, HP, features, spell slots) that a
// member is missing — so every companion has spells/abilities listed, whether
// built at creation, loaded from an old save, or introduced by the DM.
function ensureClassDetail(m: PartyMember): PartyMember {
  const stats = statsForClass(m.kind || m.className)
  if (!stats) return m
  return {
    ...m,
    abilities: m.abilities ?? stats.abilities,
    ac: m.ac ?? stats.ac,
    maxHp: m.maxHp > 1 ? m.maxHp : stats.maxHp,
    hp: m.maxHp > 1 ? m.hp : stats.maxHp,
    features: m.features && m.features.length ? m.features : stats.features,
    spellSlots: m.spellSlots ?? stats.spellSlots
  }
}

function mergeParty(prev: PartyMember[], updates: PartyUpdate[], level: number): PartyMember[] {
  const merged = updates.map((u) => {
    const old = prev.find((p) => p.name === u.name)
    const base: PartyMember = old ?? {
      name: u.name,
      className: u.className ?? '',
      kind: u.kind ?? 'ally',
      hp: u.hp ?? 1,
      maxHp: u.maxHp ?? 1,
      distance: u.distance ?? 5,
      status: 'active'
    }
    const maxHp = u.maxHp ?? base.maxHp
    const member: PartyMember = {
      ...base,
      className: u.className ?? base.className,
      kind: u.kind ?? base.kind,
      gender: u.gender ?? base.gender,
      level: level,
      maxHp,
      hp: u.hp !== undefined ? Math.min(u.hp, maxHp) : base.hp,
      distance: u.distance ?? base.distance,
      abilities: u.abilities ? { ...base.abilities, ...u.abilities } : base.abilities,
      conditions: u.conditions ?? base.conditions,
      ac: u.ac ?? base.ac,
      status: u.status ?? base.status ?? 'active',
      inventory: u.inventory ?? base.inventory,
      bond: u.bond ?? base.bond,
      flaw: u.flaw ?? base.flaw,
      trait: u.trait ?? base.trait,
      relationships: u.relationships ?? base.relationships,
      moments: u.moments ?? base.moments,
      spellSlots: u.spellSlots ?? base.spellSlots,
      features: u.features ?? base.features
    }
    return ensureClassDetail(member)
  })
  return enforceActiveCap(merged)
}

// Backfill AC/abilities on enemy cards from the canonical bestiary when the DM
// omits them — so the UI shows source-of-truth numbers.
function enrichEnemies(enemies: Enemy[]): Enemy[] {
  return enemies.map((e) => {
    if (e.ac !== undefined && e.abilities) return e
    const m = findMonster(e.name) ?? findMonster(e.kind)
    if (!m) return e
    return { ...e, ac: e.ac ?? m.ac, abilities: e.abilities ?? m.abilities }
  })
}

// At most MAX_ACTIVE_COMPANIONS may be active; extras are sent to camp.
function enforceActiveCap(members: PartyMember[]): PartyMember[] {
  let active = 0
  return members.map((m) => {
    if (m.status === 'camp') return m
    active += 1
    return active <= MAX_ACTIVE_COMPANIONS ? m : { ...m, status: 'camp' }
  })
}

function stampLevel(party: PartyMember[], level: number): PartyMember[] {
  return party.map((p) => (p.level === level ? p : { ...p, level }))
}

export interface Game {
  phase: Phase
  character: Character | null
  messages: Message[]
  enemies: Enemy[]
  party: PartyMember[]
  combat: CombatState | null
  pendingRoll: RollRequest | null
  xp: number
  level: number
  levelUp: LevelUpSummary | null
  busy: boolean
  error: string | null
  hasSave: boolean
  startCreation: () => void
  startNewGame: (character: Character, party: PartyMember[], mode: BackstoryMode) => void
  continueGame: () => Promise<void>
  sendAction: (text: string) => void
  dismissLevelUp: () => void
  quitToMenu: () => void
}

export function useGame(): Game {
  const [phase, setPhase] = useState<Phase>('menu')
  const [character, setCharacter] = useState<Character | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [party, setParty] = useState<PartyMember[]>([])
  const [combat, setCombat] = useState<CombatState | null>(null)
  const [pendingRoll, setPendingRoll] = useState<RollRequest | null>(null)
  const [levelUp, setLevelUp] = useState<LevelUpSummary | null>(null)
  const [xp, setXp] = useState(0)
  const [backstoryMode, setBackstoryMode] = useState<BackstoryMode>('flavor')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSave, setHasSave] = useState(false)

  const level = levelFromXp(xp)

  useEffect(() => {
    window.api.loadGame().then((g) => setHasSave(!!g))
  }, [])

  // Replies render all at once; drain (ignore) any streamed deltas.
  useEffect(() => window.api.onDelta(() => {}), [])

  const runTurn = useCallback(
    async (
      char: Character,
      history: Message[],
      partyNow: PartyMember[],
      enemiesNow: Enemy[],
      xpNow: number,
      mode: BackstoryMode
    ) => {
      setBusy(true)
      setError(null)
      setPendingRoll(null) // hide any stale roll widget while the DM responds
      try {
        const text = await window.api.dmRespond({
          character: char,
          party: partyNow,
          level: levelFromXp(xpNow),
          backstoryMode: mode,
          inCombat: enemiesNow.length > 0,
          bestiary: {
            index: bestiaryIndex(),
            active: statBlocksFor(enemiesNow.flatMap((e) => [e.name, e.kind]))
          },
          messages: history
        })
        const next: Message[] = [...history, { role: 'assistant', content: text }]
        setMessages(next)

        // XP / level first, so members can be stamped with the new level.
        const parsedXp = parseProgress(text)
        const nextXp = parsedXp ?? xpNow
        if (parsedXp !== null) setXp(parsedXp)
        const oldLevel = levelFromXp(xpNow)
        const lvl = levelFromXp(nextXp)

        const parsedEnemies = parseEnemies(text)
        const nextEnemies = parsedEnemies ? enrichEnemies(parsedEnemies) : enemiesNow
        if (parsedEnemies) setEnemies(nextEnemies)

        const parsedParty = parseParty(text)
        let nextParty = parsedParty ? mergeParty(partyNow, parsedParty, lvl) : stampLevel(partyNow, lvl)

        const heroUpdate = parseHero(text)
        let nextChar = heroUpdate ? mergeHero(char, heroUpdate) : char
        if (nextChar.level !== lvl) nextChar = { ...nextChar, level: lvl }

        // Deterministic mechanical level-up (HP, proficiency, features, slots).
        if (lvl > oldLevel) {
          const res = applyLevelUp(nextChar, nextParty, oldLevel, lvl)
          nextChar = res.character
          nextParty = res.party
          setLevelUp(res.summary)
        }

        setParty(nextParty)
        setCharacter(nextChar)

        const parsedCombat = parseCombat(text)
        const nextCombat = parsedCombat ?? combat
        if (parsedCombat) setCombat(parsedCombat.active ? parsedCombat : null)

        setPendingRoll(parseRoll(text))

        const save: SavedGame = {
          character: nextChar,
          messages: next,
          enemies: nextEnemies,
          party: nextParty,
          backstoryMode: mode,
          xp: nextXp,
          combat: parsedCombat && parsedCombat.active ? parsedCombat : nextCombat,
          createdAt: new Date().toISOString()
        }
        await window.api.saveGame(save)
        setHasSave(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setBusy(false)
      }
    },
    [combat]
  )

  const startCreation = useCallback(() => setPhase('creation'), [])

  const startNewGame = useCallback(
    (char: Character, initialParty: PartyMember[], mode: BackstoryMode) => {
      setCharacter(char)
      setEnemies([])
      setParty(enforceActiveCap(initialParty.map(ensureClassDetail)))
      setCombat(null)
      setPendingRoll(null)
      setLevelUp(null)
      setXp(0)
      setBackstoryMode(mode)
      setPhase('playing')
      const kickoff: Message[] = [{ role: 'user', content: OPENING_PROMPT }]
      setMessages(kickoff)
      runTurn(char, kickoff, initialParty, [], 0, mode)
    },
    [runTurn]
  )

  const continueGame = useCallback(async () => {
    const g = (await window.api.loadGame()) as SavedGame | null
    if (!g) return
    setCharacter(g.character)
    setMessages(g.messages)
    setEnemies(g.enemies ?? [])
    setParty((g.party ?? []).map(ensureClassDetail))
    setCombat(g.combat ?? null)
    setXp(g.xp ?? 0)
    setBackstoryMode(g.backstoryMode ?? 'flavor')
    // Restore a pending roll from the last DM message, if any.
    const lastDm = [...g.messages].reverse().find((m) => m.role === 'assistant')
    setPendingRoll(lastDm ? parseRoll(lastDm.content) : null)
    setPhase('playing')
  }, [])

  const sendAction = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || !character || busy) return
      const history: Message[] = [...messages, { role: 'user', content: trimmed }]
      setMessages(history)
      runTurn(character, history, party, enemies, xp, backstoryMode)
    },
    [character, messages, party, enemies, xp, backstoryMode, busy, runTurn]
  )

  const dismissLevelUp = useCallback(() => setLevelUp(null), [])

  const quitToMenu = useCallback(() => {
    setPhase('menu')
    setCharacter(null)
    setMessages([])
    setEnemies([])
    setParty([])
    setCombat(null)
    setPendingRoll(null)
    setLevelUp(null)
    setXp(0)
    setError(null)
  }, [])

  return {
    phase,
    character,
    messages,
    enemies,
    party,
    combat,
    pendingRoll,
    xp,
    level,
    levelUp,
    busy,
    error,
    hasSave,
    startCreation,
    startNewGame,
    continueGame,
    sendAction,
    dismissLevelUp,
    quitToMenu
  }
}
