import { xpForLevel } from '@renderer/state/types'

export function PartyXpBar({ xp, level }: { xp: number; level: number }) {
  const cur = xpForLevel(level)
  const next = level >= 20 ? xpForLevel(20) : xpForLevel(level + 1)
  const span = next - cur
  const pct = span > 0 ? Math.max(0, Math.min(100, ((xp - cur) / span) * 100)) : 100

  return (
    <div className="xpbar">
      <div className="xpbar-top">
        <span>Party · Level {level}</span>
        <span>{level >= 20 ? 'MAX' : `${xp} / ${next} XP`}</span>
      </div>
      <div className="xpbar-track">
        <div className="xpbar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
