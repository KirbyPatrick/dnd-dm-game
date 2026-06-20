import { SPRITES } from '@renderer/data/sprites'
import { distanceLabel, type Enemy } from '@renderer/state/types'
import { PixelSprite } from './PixelSprite'

export function EnemyCard({ enemy, onOpen }: { enemy: Enemy; onOpen: () => void }) {
  const def = SPRITES[enemy.kind] ?? SPRITES.default
  const dead = enemy.hp <= 0
  const pct = Math.max(0, Math.min(100, Math.round((enemy.hp / enemy.maxHp) * 100)))

  return (
    <button className={`enemy-card ${dead ? 'dead' : ''}`} onClick={onOpen} title="View details">
      <div className="enemy-sprite">
        <PixelSprite def={def} size={64} />
      </div>
      <div className="enemy-name">{enemy.name}</div>
      <div className="enemy-hpbar">
        <div className="enemy-hpfill" style={{ width: `${pct}%` }} />
      </div>
      <div className="enemy-stats">
        <span>
          {dead ? 'Defeated' : `${enemy.hp}/${enemy.maxHp} HP`}
        </span>
        {!dead && <span className="enemy-dist">{distanceLabel(enemy.distance)}</span>}
      </div>
    </button>
  )
}

export function EnemyPanel({ enemies, onOpen }: { enemies: Enemy[]; onOpen: (name: string) => void }) {
  if (enemies.length === 0) return null
  return (
    <div className="enemy-panel">
      {enemies.map((e, i) => (
        <EnemyCard key={`${e.name}-${i}`} enemy={e} onOpen={() => onOpen(e.name)} />
      ))}
    </div>
  )
}
