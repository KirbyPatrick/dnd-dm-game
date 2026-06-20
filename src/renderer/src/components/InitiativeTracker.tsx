import type { CombatState } from '@renderer/state/types'

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th']
const ordinal = (i: number): string => ORDINALS[i] ?? `${i + 1}th`

export function InitiativeTracker({ combat }: { combat: CombatState }) {
  if (!combat.active || combat.order.length === 0) return null
  const order = [...combat.order].sort((a, b) => b.init - a.init)

  return (
    <div className="initiative">
      <div className="init-head">
        ⚔ Initiative{combat.round ? ` · Round ${combat.round}` : ''}
      </div>
      <div className="init-list">
        {order.map((c, i) => (
          <div
            key={`${c.name}-${i}`}
            className={`init-row ${c.side} ${combat.turn === c.name ? 'active' : ''}`}
          >
            <span className="init-ord">{ordinal(i)}</span>
            <span className="init-name">{c.name}</span>
            <span className="init-val">{c.init}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
