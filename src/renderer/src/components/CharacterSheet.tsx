import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  formatMod,
  type Character,
  type PartyMember
} from '@renderer/state/types'
import { PartyList } from './PartyCard'
import { PartyXpBar } from './PartyXpBar'

interface Props {
  character: Character
  party: PartyMember[]
  xp: number
  level: number
  onOpenHero: () => void
  onOpenParty: (name: string) => void
}

export function CharacterSheet({ character: c, party, xp, level, onOpenHero, onOpenParty }: Props) {
  return (
    <aside className="sheet">
      <button className="hero-header" onClick={onOpenHero} title="View details">
        <h2 className="sheet-name">{c.name}</h2>
        <p className="sheet-sub">
          Level {c.level} {c.raceName} {c.className}
        </p>
      </button>

      <div className="hp">
        <span>Hit Points</span>
        <strong>
          {c.hp} / {c.maxHp}
        </strong>
        <div className="hp-bar">
          <div
            className="hp-bar-fill"
            style={{ width: `${Math.max(0, Math.min(100, (c.hp / c.maxHp) * 100))}%` }}
          />
        </div>
      </div>

      {c.conditions && c.conditions.length > 0 && (
        <div className="conditions">
          {c.conditions.map((cond) => (
            <span key={cond} className="condition">
              {cond}
            </span>
          ))}
        </div>
      )}

      <div className="abilities">
        {ABILITY_KEYS.map((k) => (
          <div key={k} className="ability">
            <span className="ability-label">{ABILITY_LABELS[k].slice(0, 3).toUpperCase()}</span>
            <span className="ability-score">{c.abilities[k]}</span>
            <span className="ability-mod">{formatMod(c.abilities[k])}</span>
          </div>
        ))}
      </div>

      <PartyXpBar xp={xp} level={level} />

      <PartyList party={party} onOpen={onOpenParty} />
    </aside>
  )
}
