import { CLASSES } from './classes'
import { findClass } from './partyStats'
import type { Feature } from '@renderer/state/types'

// Per-class gains at each level (levels 2-5 in depth; level 1 lives in
// features.ts). Caster spell-slot strings are baked into each level so applying
// a level sets the current slots. Beyond level 5 the client still applies HP +
// proficiency deterministically; new features then come from the DM.
export interface LevelGain {
  features?: Feature[]
  spellSlots?: string
}

const FULL: Record<number, string> = {
  1: '1st 2/2',
  2: '1st 3/3',
  3: '1st 4/4 · 2nd 2/2',
  4: '1st 4/4 · 2nd 3/3',
  5: '1st 4/4 · 2nd 3/3 · 3rd 2/2'
}
const HALF: Record<number, string> = {
  2: '1st 2/2',
  3: '1st 3/3',
  4: '1st 3/3',
  5: '1st 4/4 · 2nd 2/2'
}
const PACT: Record<number, string> = {
  1: 'Pact 1/1 (1st)',
  2: 'Pact 2/2 (1st)',
  3: 'Pact 2/2 (2nd)',
  4: 'Pact 2/2 (2nd)',
  5: 'Pact 2/2 (3rd)'
}

const ASI: Feature = {
  name: 'Ability Score Improvement',
  note: '+2 to one ability or +1 to two, or a feat.'
}
const SUBCLASS = (label: string): Feature => ({
  name: `Subclass: ${label}`,
  note: 'Choose your subclass now — it grants new features.'
})

export const CLASS_PROGRESSION: Record<string, Record<number, LevelGain>> = {
  barbarian: {
    2: { features: [{ name: 'Reckless Attack', note: 'Advantage on STR melee; foes get advantage on you.' }, { name: 'Danger Sense', note: 'Advantage on DEX saves you can see.' }] },
    3: { features: [SUBCLASS('Primal Path'), { name: 'Primal Knowledge', note: 'Extra skill; use STR for some checks while raging.' }] },
    4: { features: [ASI] },
    5: { features: [{ name: 'Extra Attack', note: 'Attack twice when you take the Attack action.' }, { name: 'Fast Movement', note: '+10 ft speed unarmored.' }] }
  },
  bard: {
    2: { features: [{ name: 'Expertise', note: 'Double proficiency on two skills.' }, { name: 'Jack of All Trades', note: 'Half proficiency to non-proficient ability checks.' }], spellSlots: FULL[2] },
    3: { features: [SUBCLASS('Bard College')], spellSlots: FULL[3] },
    4: { features: [ASI], spellSlots: FULL[4] },
    5: { features: [{ name: 'Font of Inspiration', note: 'Regain Bardic Inspiration on a short or long rest.' }], spellSlots: FULL[5] }
  },
  cleric: {
    2: { features: [{ name: 'Channel Divinity', note: 'Turn Undead and a domain effect; 1/rest.' }], spellSlots: FULL[2] },
    3: { features: [SUBCLASS('Divine Domain')], spellSlots: FULL[3] },
    4: { features: [ASI], spellSlots: FULL[4] },
    5: { features: [{ name: 'Destroy Undead', note: 'Turned undead of low CR are destroyed.' }], spellSlots: FULL[5] }
  },
  druid: {
    2: { features: [{ name: 'Wild Shape', note: 'Transform into beasts you have seen.' }, { name: 'Wild Companion', note: 'Summon a spirit familiar.' }], spellSlots: FULL[2] },
    3: { features: [SUBCLASS('Druid Circle')], spellSlots: FULL[3] },
    4: { features: [ASI], spellSlots: FULL[4] },
    5: { spellSlots: FULL[5] }
  },
  fighter: {
    2: { features: [{ name: 'Action Surge', note: 'Take one extra action; 1/rest.' }] },
    3: { features: [SUBCLASS('Martial Archetype')] },
    4: { features: [ASI] },
    5: { features: [{ name: 'Extra Attack', note: 'Attack twice when you take the Attack action.' }] }
  },
  monk: {
    2: { features: [{ name: 'Monk’s Focus (Ki)', note: 'Focus points fuel Flurry of Blows, Patient Defense, Step of the Wind.' }, { name: 'Unarmored Movement', note: '+10 ft speed.' }] },
    3: { features: [SUBCLASS('Monk Subclass'), { name: 'Deflect Attacks', note: 'Reduce damage from an attack; possibly redirect it.' }] },
    4: { features: [ASI, { name: 'Slow Fall', note: 'Reduce falling damage.' }] },
    5: { features: [{ name: 'Extra Attack', note: 'Attack twice.' }, { name: 'Stunning Strike', note: 'Spend focus to stun a creature.' }] }
  },
  paladin: {
    2: { features: [{ name: 'Fighting Style', note: 'A combat specialty.' }, { name: 'Paladin’s Smite', note: 'Always have Divine Smite prepared.' }], spellSlots: HALF[2] },
    3: { features: [SUBCLASS('Sacred Oath'), { name: 'Channel Divinity', note: 'Oath-specific divine effects.' }], spellSlots: HALF[3] },
    4: { features: [ASI], spellSlots: HALF[4] },
    5: { features: [{ name: 'Extra Attack', note: 'Attack twice.' }, { name: 'Faithful Steed', note: 'Always have Find Steed prepared.' }], spellSlots: HALF[5] }
  },
  ranger: {
    2: { features: [{ name: 'Deft Explorer', note: 'Expertise and extra languages.' }, { name: 'Fighting Style', note: 'A combat specialty.' }], spellSlots: HALF[2] },
    3: { features: [SUBCLASS('Ranger Conclave')], spellSlots: HALF[3] },
    4: { features: [ASI], spellSlots: HALF[4] },
    5: { features: [{ name: 'Extra Attack', note: 'Attack twice.' }], spellSlots: HALF[5] }
  },
  rogue: {
    2: { features: [{ name: 'Cunning Action', note: 'Bonus-action Dash, Disengage, or Hide.' }] },
    3: { features: [SUBCLASS('Roguish Archetype'), { name: 'Steady Aim', note: 'Bonus action for advantage if you don’t move.' }, { name: 'Sneak Attack 2d6', note: 'Sneak Attack damage increases.' }] },
    4: { features: [ASI] },
    5: { features: [{ name: 'Cunning Strike', note: 'Trade Sneak Attack dice for effects.' }, { name: 'Uncanny Dodge', note: 'Halve damage from one attack as a reaction.' }, { name: 'Sneak Attack 3d6', note: 'Sneak Attack damage increases.' }] }
  },
  sorcerer: {
    2: { features: [{ name: 'Font of Magic', note: 'Sorcery Points; convert to/from spell slots.' }, { name: 'Metamagic', note: 'Two ways to bend your spells.' }], spellSlots: FULL[2] },
    3: { features: [SUBCLASS('Sorcerous Origin')], spellSlots: FULL[3] },
    4: { features: [ASI], spellSlots: FULL[4] },
    5: { features: [{ name: 'Sorcerous Restoration', note: 'Regain sorcery points on a short rest.' }], spellSlots: FULL[5] }
  },
  warlock: {
    2: { features: [{ name: 'Magical Cunning', note: 'Regain Pact Magic slots once per long rest.' }, { name: 'Eldritch Invocations', note: 'Additional invocation.' }], spellSlots: PACT[2] },
    3: { features: [SUBCLASS('Otherworldly Patron'), { name: 'Pact Boon', note: 'Pact of the Blade, Chain, Tome, or Talisman.' }], spellSlots: PACT[3] },
    4: { features: [ASI], spellSlots: PACT[4] },
    5: { spellSlots: PACT[5] }
  },
  wizard: {
    2: { features: [{ name: 'Scholar', note: 'Expertise in an Arcana-type skill.' }], spellSlots: FULL[2] },
    3: { features: [SUBCLASS('Arcane Tradition')], spellSlots: FULL[3] },
    4: { features: [ASI], spellSlots: FULL[4] },
    5: { features: [{ name: 'Memorize Spell', note: 'Swap a prepared spell on a short rest.' }], spellSlots: FULL[5] }
  }
}

const HIT_DIE_AVG: Record<number, number> = { 6: 4, 8: 5, 10: 6, 12: 7 }

export function hpPerLevel(classIdOrName: string): number {
  const cls = findClass(classIdOrName) ?? CLASSES[0]
  return HIT_DIE_AVG[cls.hitDie] ?? 5
}

export interface AggregatedGains {
  features: Feature[]
  spellSlots?: string
}

/** Aggregate everything gained going from `fromLevel` (exclusive) to `toLevel`. */
export function gainsBetween(classIdOrName: string, fromLevel: number, toLevel: number): AggregatedGains {
  const cls = findClass(classIdOrName)
  const table = cls ? CLASS_PROGRESSION[cls.id] : undefined
  const features: Feature[] = []
  let spellSlots: string | undefined
  for (let l = fromLevel + 1; l <= toLevel; l++) {
    const g = table?.[l]
    if (!g) continue
    if (g.features) features.push(...g.features)
    if (g.spellSlots) spellSlots = g.spellSlots
  }
  return { features, spellSlots }
}
