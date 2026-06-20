import { SPRITES } from '@renderer/data/sprites'
import { distanceLabel, type PartyMember } from '@renderer/state/types'
import { PixelSprite } from './PixelSprite'

export function PartyCard({ member, onOpen }: { member: PartyMember; onOpen: () => void }) {
  const def = SPRITES[member.kind] ?? SPRITES.ally
  const down = member.hp <= 0
  const pct = Math.max(0, Math.min(100, Math.round((member.hp / member.maxHp) * 100)))

  return (
    <button className={`party-card ${down ? 'down' : ''}`} onClick={onOpen} title="View details">
      <div className="party-sprite">
        <PixelSprite def={def} size={40} />
      </div>
      <div className="party-info">
        <div className="party-name">{member.name}</div>
        {member.className && (
          <div className="party-class">
            {member.className}
            {member.subclass ? ` · ${member.subclass}` : ''}
          </div>
        )}
        <div className="party-hpbar">
          <div className="party-hpfill" style={{ width: `${pct}%` }} />
        </div>
        <div className="party-stats">
          <span>{down ? 'Down' : `${member.hp}/${member.maxHp}`}</span>
          {!down && <span className="party-dist">{distanceLabel(member.distance)}</span>}
        </div>
      </div>
    </button>
  )
}

export function PartyList({ party, onOpen }: { party: PartyMember[]; onOpen: (name: string) => void }) {
  if (party.length === 0) return null
  const active = party.filter((m) => m.status !== 'camp')
  const camp = party.filter((m) => m.status === 'camp')
  return (
    <div className="party-list">
      {active.length > 0 && (
        <>
          <h3 className="party-heading">Party</h3>
          {active.map((m, i) => (
            <PartyCard key={`${m.name}-${i}`} member={m} onOpen={() => onOpen(m.name)} />
          ))}
        </>
      )}
      {camp.length > 0 && (
        <>
          <h3 className="party-heading camp">At Camp</h3>
          {camp.map((m, i) => (
            <PartyCard key={`camp-${m.name}-${i}`} member={m} onOpen={() => onOpen(m.name)} />
          ))}
        </>
      )}
    </div>
  )
}
