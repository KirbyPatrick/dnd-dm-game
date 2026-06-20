import type { Feature } from '@renderer/state/types'

// Level-1 class features, cantrips and starting spells (2024 PHB-flavored, kept
// concise). The DM is the rules authority and extends/updates these on level-up.
export interface ClassStart {
  features: Feature[]
  spellSlots?: string
}

export const CLASS_FEATURES: Record<string, ClassStart> = {
  barbarian: {
    features: [
      { name: 'Rage', note: 'Bonus action; bonus melee damage, resistance to bludgeoning/piercing/slashing.' },
      { name: 'Unarmored Defense', note: 'AC = 10 + DEX + CON when not wearing armor.' },
      { name: 'Weapon Mastery', note: 'Use the mastery property of two weapons you wield.' }
    ]
  },
  bard: {
    features: [
      { name: 'Spellcasting', note: 'Cast bard spells using Charisma.' },
      { name: 'Bardic Inspiration', note: 'Bonus action; give an ally a d6 to add to a roll.' },
      { name: 'Cantrips', note: 'Vicious Mockery, Prestidigitation.' },
      { name: '1st-level spells', note: 'e.g. Healing Word, Faerie Fire, Charm Person.' }
    ],
    spellSlots: '1st 2/2'
  },
  cleric: {
    features: [
      { name: 'Spellcasting', note: 'Cast cleric spells using Wisdom; prepared caster.' },
      { name: 'Divine Order', note: 'Choose Protector or Thaumaturge.' },
      { name: 'Cantrips', note: 'Sacred Flame, Guidance.' },
      { name: '1st-level spells', note: 'e.g. Cure Wounds, Bless, Guiding Bolt.' }
    ],
    spellSlots: '1st 2/2'
  },
  druid: {
    features: [
      { name: 'Spellcasting', note: 'Cast druid spells using Wisdom; prepared caster.' },
      { name: 'Druidic', note: 'Secret language of druids.' },
      { name: 'Primal Order', note: 'Choose Magician or Warden.' },
      { name: 'Cantrips', note: 'Druidcraft, Produce Flame.' }
    ],
    spellSlots: '1st 2/2'
  },
  fighter: {
    features: [
      { name: 'Fighting Style', note: 'A combat specialty (e.g. Defense, Dueling, Archery).' },
      { name: 'Second Wind', note: 'Bonus action; regain 1d10 + level HP.' },
      { name: 'Weapon Mastery', note: 'Use the mastery property of three weapons.' }
    ]
  },
  monk: {
    features: [
      { name: 'Martial Arts', note: 'Unarmed strikes use DEX; bonus-action unarmed strike.' },
      { name: 'Unarmored Defense', note: 'AC = 10 + DEX + WIS without armor or shield.' }
    ]
  },
  paladin: {
    features: [
      { name: 'Lay on Hands', note: 'Pool of healing equal to 5 × level.' },
      { name: 'Spellcasting', note: 'Cast paladin spells using Charisma.' },
      { name: 'Weapon Mastery', note: 'Use the mastery property of two weapons.' }
    ],
    spellSlots: '—'
  },
  ranger: {
    features: [
      { name: 'Spellcasting', note: 'Cast ranger spells using Wisdom.' },
      { name: 'Favored Enemy', note: 'Always have Hunter’s Mark prepared; cast it a few times/day.' },
      { name: 'Weapon Mastery', note: 'Use the mastery property of two weapons.' }
    ],
    spellSlots: '—'
  },
  rogue: {
    features: [
      { name: 'Expertise', note: 'Double proficiency on two skills.' },
      { name: 'Sneak Attack', note: '1d6 extra damage with advantage or a flanking ally.' },
      { name: "Thieves' Cant", note: 'Secret mix of dialect and code.' },
      { name: 'Weapon Mastery', note: 'Use the mastery property of two weapons.' }
    ]
  },
  sorcerer: {
    features: [
      { name: 'Spellcasting', note: 'Cast sorcerer spells using Charisma.' },
      { name: 'Innate Sorcery', note: 'Bonus action; +1 spell save DC and advantage on attacks briefly.' },
      { name: 'Cantrips', note: 'Fire Bolt, Prestidigitation, Mage Hand.' }
    ],
    spellSlots: '1st 2/2'
  },
  warlock: {
    features: [
      { name: 'Pact Magic', note: 'Charisma casting; slots recharge on a short rest.' },
      { name: 'Eldritch Invocations', note: 'Two minor magical boons.' },
      { name: 'Cantrips', note: 'Eldritch Blast, Prestidigitation.' }
    ],
    spellSlots: 'Pact 1/1'
  },
  wizard: {
    features: [
      { name: 'Spellcasting', note: 'Cast wizard spells from your spellbook using Intelligence.' },
      { name: 'Arcane Recovery', note: 'Recover some spell slots on a short rest.' },
      { name: 'Cantrips', note: 'Fire Bolt, Mage Hand, Prestidigitation.' },
      { name: '1st-level spells', note: 'e.g. Magic Missile, Shield, Mage Armor.' }
    ],
    spellSlots: '1st 2/2'
  }
}
