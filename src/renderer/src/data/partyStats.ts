import { CLASSES, type CharClass } from './classes'
import { CLASS_FEATURES } from './features'
import {
  ABILITY_KEYS,
  abilityMod,
  type AbilityKey,
  type AbilityScores,
  type Feature
} from '@renderer/state/types'

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]

/** Auto-assign the standard array: primary stat highest, the rest descending. */
export function buildAbilities(primary: AbilityKey): AbilityScores {
  const order: AbilityKey[] = [primary, ...ABILITY_KEYS.filter((k) => k !== primary)]
  const ab = {} as AbilityScores
  order.forEach((k, i) => (ab[k] = STANDARD_ARRAY[i]))
  return ab
}

export function findClass(idOrName: string): CharClass | undefined {
  const key = idOrName.toLowerCase()
  return CLASSES.find((c) => c.id === key || c.name.toLowerCase() === key)
}

export interface ClassStats {
  abilities: AbilityScores
  ac: number
  maxHp: number
  features: Feature[]
  spellSlots?: string
}

/** Class-appropriate level-1 stats for an auto-generated companion. */
export function statsForClass(idOrName: string): ClassStats | null {
  const cls = findClass(idOrName)
  if (!cls) return null
  const abilities = buildAbilities(cls.primary)
  const start = CLASS_FEATURES[cls.id]
  return {
    abilities,
    ac: 10 + abilityMod(abilities.dex),
    maxHp: cls.hitDie + abilityMod(abilities.con),
    features: start?.features ?? [],
    spellSlots: start?.spellSlots
  }
}
