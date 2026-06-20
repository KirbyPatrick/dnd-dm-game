import type { Character, PartyMember } from '@renderer/state/types'
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
      <button className="hero-header" onClick={onOpenHero} title="View full character sheet">
        <h2 className="sheet-name">{c.name}</h2>
        <p className="sheet-sub">
          Level {c.level} {c.raceName}
        </p>
        <p className="sheet-class">
          {c.className}
          {c.subclass ? ` - ${c.subclass}` : ''}
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

      <PartyXpBar xp={xp} level={level} />

      <PartyList party={party} onOpen={onOpenParty} />
    </aside>
  )
}
