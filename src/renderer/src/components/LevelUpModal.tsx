import type { LevelUpSummary } from '@renderer/state/useGame'

export function LevelUpModal({ summary, onClose }: { summary: LevelUpSummary; onClose: () => void }) {
  const beyond = summary.toLevel > 5
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal levelup" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <div className="levelup-badge">★</div>
          <div>
            <h2 className="modal-name">Level Up!</h2>
            <p className="modal-sub">
              The party reaches level {summary.toLevel} · Proficiency +{summary.proficiency}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="tab-body">
          {summary.members.map((m, i) => (
            <div key={i} className="lvl-member">
              <div className="lvl-member-head">
                <strong>{m.name}</strong>
                <span className="li-note">{m.className}</span>
              </div>
              <div className="lvl-line">
                +{m.hpGain} HP → {m.newMaxHp} max
                {m.spellSlots ? ` · spell slots: ${m.spellSlots}` : ''}
              </div>
              {m.newFeatures.length > 0 ? (
                <ul className="detail-list lvl-feats">
                  {m.newFeatures.map((f, j) => (
                    <li key={j}>
                      <span className="li-title">{f}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="tab-empty">No new feature at this level.</p>
              )}
            </div>
          ))}
          {beyond && (
            <p className="tab-empty">
              HP and proficiency applied automatically; level 6+ feature details are filled in by the
              Dungeon Master.
            </p>
          )}
        </div>

        <div className="levelup-foot">
          <button className="btn primary" onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
