import { useEffect, useState, type ReactNode } from 'react'
import { SPRITES } from '@renderer/data/sprites'
import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  distanceLabel,
  formatMod,
  type AbilityScores,
  type CharSheet,
  type Character,
  type Enemy,
  type PartyMember
} from '@renderer/state/types'
import { PixelSprite } from './PixelSprite'

/** What the player clicked. Resolved to live data each render by the caller. */
export type Selection =
  | { kind: 'hero' }
  | { kind: 'party'; name: string }
  | { kind: 'enemy'; name: string }

type Subject =
  | { kind: 'hero'; data: Character }
  | { kind: 'party'; data: PartyMember }
  | { kind: 'enemy'; data: Enemy }

type Tab = 'stats' | 'inventory' | 'relationship' | 'spells'

const HERO_TABS: { id: Tab; label: string }[] = [
  { id: 'stats', label: 'Stats' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'relationship', label: 'Relationship' },
  { id: 'spells', label: 'Spells & Abilities' }
]

export function DetailModal({ subject, onClose }: { subject: Subject; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('stats')

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const { kind, data } = subject
  const sprite = SPRITES[(data as { kind?: string }).kind ?? ''] ?? SPRITES.default
  const isEnemy = kind === 'enemy'
  const tabs = isEnemy ? HERO_TABS.slice(0, 1) : HERO_TABS

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <div className="modal-sprite">
            <PixelSprite def={sprite} size={56} />
          </div>
          <div>
            <h2 className="modal-name">{data.name}</h2>
            <p className="modal-sub">{subtitle(subject)}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="tab-bar">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="tab-body">
          {tab === 'stats' && <StatsTab subject={subject} />}
          {tab === 'inventory' && !isEnemy && <InventoryTab sheet={data as CharSheet} />}
          {tab === 'relationship' && !isEnemy && <RelationshipTab sheet={data as CharSheet} />}
          {tab === 'spells' && !isEnemy && <SpellsTab sheet={data as CharSheet} />}
        </div>
      </div>
    </div>
  )
}

function subtitle(subject: Subject): string {
  if (subject.kind === 'enemy') {
    const e = subject.data
    return `Foe · ${distanceLabel(e.distance)}`
  }
  const d = subject.data
  const gender = d.gender ? `${d.gender} · ` : ''
  const sub = d.subclass ? ` · ${d.subclass}` : ''
  if (subject.kind === 'hero') {
    return `${gender}Level ${d.level} ${(d as Character).raceName} ${d.className}${sub}`
  }
  const pm = d as PartyMember
  return `${gender}Level ${pm.level ?? 1} ${pm.className}${sub}`
}

function StatsTab({ subject }: { subject: Subject }) {
  const d = subject.data
  const abilities = (d as { abilities?: Partial<AbilityScores> }).abilities
  const ac = (d as { ac?: number }).ac
  const conditions = (d as { conditions?: string[] }).conditions ?? []

  return (
    <div>
      <div className="stat-line">
        <Stat label="HP" value={`${d.hp} / ${d.maxHp}`} />
        <Stat label="AC" value={ac !== undefined ? String(ac) : '—'} />
        {subject.kind !== 'enemy' && 'level' in d && (
          <Stat label="Level" value={String((d as Character).level ?? (d as PartyMember).level ?? 1)} />
        )}
      </div>

      {abilities && Object.keys(abilities).length > 0 ? (
        <div className="modal-abilities">
          {ABILITY_KEYS.filter((k) => abilities[k] !== undefined).map((k) => (
            <div key={k} className="modal-ability">
              <span className="ability-label">{ABILITY_LABELS[k].slice(0, 3).toUpperCase()}</span>
              <span className="ability-score">{abilities[k]}</span>
              <span className="ability-mod">{formatMod(abilities[k] as number)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="tab-empty">No ability scores recorded.</p>
      )}

      <Section title="Conditions">
        {conditions.length ? (
          <div className="chip-wrap">
            {conditions.map((c) => (
              <span key={c} className="condition">
                {c}
              </span>
            ))}
          </div>
        ) : (
          <p className="tab-empty">None.</p>
        )}
      </Section>
    </div>
  )
}

function InventoryTab({ sheet }: { sheet: CharSheet }) {
  const inv = sheet.inventory ?? []
  if (inv.length === 0) return <p className="tab-empty">Carrying nothing of note.</p>
  return (
    <ul className="detail-list">
      {inv.map((it, i) => (
        <li key={i}>
          <span className="li-title">
            {it.name}
            {it.qty && it.qty > 1 ? ` ×${it.qty}` : ''}
          </span>
          {it.note && <span className="li-note">{it.note}</span>}
        </li>
      ))}
    </ul>
  )
}

function RelationshipTab({ sheet }: { sheet: CharSheet }) {
  const rels = sheet.relationships ?? []
  const moments = sheet.moments ?? []
  const hasTraits = sheet.bond || sheet.flaw || sheet.trait
  if (!hasTraits && rels.length === 0 && moments.length === 0) {
    return <p className="tab-empty">Bonds and history will form as the story unfolds.</p>
  }
  return (
    <div>
      {hasTraits && (
        <Section title="Personality">
          {sheet.trait && <p className="kv"><b>Trait:</b> {sheet.trait}</p>}
          {sheet.bond && <p className="kv"><b>Bond:</b> {sheet.bond}</p>}
          {sheet.flaw && <p className="kv"><b>Flaw:</b> {sheet.flaw}</p>}
        </Section>
      )}
      {rels.length > 0 && (
        <Section title="Relationships">
          <ul className="detail-list">
            {rels.map((r, i) => (
              <li key={i}>
                <span className="li-title">{r.name}</span>
                {r.status && <span className="li-note">{r.status}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}
      {moments.length > 0 && (
        <Section title="Notable moments">
          <ul className="detail-list">
            {moments.map((m, i) => (
              <li key={i}>
                <span className="li-note">{m}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

function SpellsTab({ sheet }: { sheet: CharSheet }) {
  const feats = sheet.features ?? []
  if (!sheet.spellSlots && feats.length === 0) {
    return <p className="tab-empty">No spells or special abilities recorded yet.</p>
  }
  return (
    <div>
      {sheet.spellSlots && (
        <Section title="Spell slots">
          <p className="kv">{sheet.spellSlots}</p>
        </Section>
      )}
      {feats.length > 0 && (
        <Section title="Abilities & spells">
          <ul className="detail-list">
            {feats.map((f, i) => (
              <li key={i}>
                <span className="li-title">{f.name}</span>
                {f.note && <span className="li-note">{f.note}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-box">
      <span className="stat-box-label">{label}</span>
      <strong className="stat-box-value">{value}</strong>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="modal-section">
      <h3 className="modal-section-title">{title}</h3>
      {children}
    </div>
  )
}
