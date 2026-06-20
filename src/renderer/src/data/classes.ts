import type { AbilityKey } from '@renderer/state/types'

export interface CharClass {
  id: string
  name: string
  description: string
  hitDie: number
  primary: AbilityKey
}

// The 12 classes of the 2024 Player's Handbook.
export const CLASSES: CharClass[] = [
  {
    id: 'barbarian',
    name: 'Barbarian',
    description: 'A ferocious warrior who channels primal rage into devastating blows.',
    hitDie: 12,
    primary: 'str'
  },
  {
    id: 'bard',
    name: 'Bard',
    description: 'A silver-tongued performer whose magic flows through art and charm.',
    hitDie: 8,
    primary: 'cha'
  },
  {
    id: 'cleric',
    name: 'Cleric',
    description: 'A divine champion who heals allies and smites foes with holy power.',
    hitDie: 8,
    primary: 'wis'
  },
  {
    id: 'druid',
    name: 'Druid',
    description: 'A guardian of nature who wields elemental magic and shapeshifts into beasts.',
    hitDie: 8,
    primary: 'wis'
  },
  {
    id: 'fighter',
    name: 'Fighter',
    description: 'A master of weapons and armor who wins through sheer martial skill.',
    hitDie: 10,
    primary: 'str'
  },
  {
    id: 'monk',
    name: 'Monk',
    description: 'A disciplined martial artist who harnesses inner ki to strike and evade.',
    hitDie: 8,
    primary: 'dex'
  },
  {
    id: 'paladin',
    name: 'Paladin',
    description: 'A holy warrior bound by sacred oaths, blending martial might and divine magic.',
    hitDie: 10,
    primary: 'str'
  },
  {
    id: 'ranger',
    name: 'Ranger',
    description: 'A hunter of the wilds, deadly with a bow and at home in the wilderness.',
    hitDie: 10,
    primary: 'dex'
  },
  {
    id: 'rogue',
    name: 'Rogue',
    description: 'A cunning skirmisher who strikes from the shadows and picks any lock.',
    hitDie: 8,
    primary: 'dex'
  },
  {
    id: 'sorcerer',
    name: 'Sorcerer',
    description: 'An innate spellcaster whose magic surges from a bloodline or strange origin.',
    hitDie: 6,
    primary: 'cha'
  },
  {
    id: 'warlock',
    name: 'Warlock',
    description: 'A wielder of eldritch power granted by a pact with an otherworldly patron.',
    hitDie: 8,
    primary: 'cha'
  },
  {
    id: 'wizard',
    name: 'Wizard',
    description: 'A scholar of arcane secrets, wielding spells from a treasured book.',
    hitDie: 6,
    primary: 'int'
  }
]
