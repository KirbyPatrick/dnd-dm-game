import type { AbilityKey } from '@renderer/state/types'

export interface Race {
  id: string
  name: string
  description: string
  bonuses: Partial<Record<AbilityKey, number>>
}

// The 10 species of the 2024 Player's Handbook. (In the 2024 rules ability
// bonuses come from your background, but this game keeps a per-species bonus to
// give the roll-and-assign step some flavor.)
export const RACES: Race[] = [
  {
    id: 'aasimar',
    name: 'Aasimar',
    description: 'Touched by the celestial planes, radiant and resolute against the dark.',
    bonuses: { cha: 2, wis: 1 }
  },
  {
    id: 'dragonborn',
    name: 'Dragonborn',
    description: 'Proud, draconic folk who breathe elemental fury and value honor.',
    bonuses: { str: 2, cha: 1 }
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    description: 'Hardy folk of stone and forge, stubborn and resilient.',
    bonuses: { con: 2, str: 1 }
  },
  {
    id: 'elf',
    name: 'Elf',
    description: 'Graceful and keen-eyed, with an affinity for magic and the bow.',
    bonuses: { dex: 2, int: 1 }
  },
  {
    id: 'gnome',
    name: 'Gnome',
    description: 'Small, inventive, and irrepressibly curious tinkerers and illusionists.',
    bonuses: { int: 2, dex: 1 }
  },
  {
    id: 'goliath',
    name: 'Goliath',
    description: 'Towering nomads of the high peaks, descended from giants.',
    bonuses: { str: 2, con: 1 }
  },
  {
    id: 'halfling',
    name: 'Halfling',
    description: 'Small, nimble, and uncannily lucky in a tight spot.',
    bonuses: { dex: 2, cha: 1 }
  },
  {
    id: 'human',
    name: 'Human',
    description: 'Versatile and ambitious, humans adapt to any path they choose.',
    bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }
  },
  {
    id: 'orc',
    name: 'Orc',
    description: 'Powerful and relentless, with the endurance to push through any hardship.',
    bonuses: { str: 2, con: 1 }
  },
  {
    id: 'tiefling',
    name: 'Tiefling',
    description: 'Marked by infernal heritage, charismatic and quick-witted.',
    bonuses: { cha: 2, int: 1 }
  }
]
