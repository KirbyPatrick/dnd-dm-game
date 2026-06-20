import { useMemo, useState } from 'react'
import { RACES, type Race } from '@renderer/data/races'
import { CLASSES, type CharClass } from '@renderer/data/classes'
import { GENDERS, randomName, type Gender } from '@renderer/data/names'
import { statsForClass } from '@renderer/data/partyStats'
import { CLASS_FEATURES } from '@renderer/data/features'
import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  abilityMod,
  formatMod,
  type AbilityKey,
  type AbilityScores,
  type BackstoryMode,
  type Character,
  type PartyMember
} from '@renderer/state/types'
import { DiceRoller } from './DiceRoller'

type Slots = Record<AbilityKey, number | null>
const EMPTY: Slots = { str: null, dex: null, con: null, int: null, wis: null, cha: null }

interface CompanionDraft {
  id: number
  name: string
  gender: Gender
  classId: string
}

function makePartyMember(draft: CompanionDraft): PartyMember {
  const cls = CLASSES.find((c) => c.id === draft.classId) ?? CLASSES[0]
  const stats = statsForClass(cls.id)
  return {
    name: draft.name.trim(),
    gender: draft.gender,
    className: cls.name,
    kind: cls.id,
    level: 1,
    hp: stats?.maxHp ?? cls.hitDie,
    maxHp: stats?.maxHp ?? cls.hitDie,
    distance: 5,
    abilities: stats?.abilities,
    ac: stats?.ac,
    features: stats?.features,
    spellSlots: stats?.spellSlots,
    conditions: [],
    status: 'active'
  }
}

interface Props {
  onComplete: (character: Character, party: PartyMember[], mode: BackstoryMode) => void
  onCancel: () => void
}

const STEPS = ['Name', 'Race', 'Class', 'Roll', 'Story', 'Party', 'Review']

export function CharacterCreation({ onComplete, onCancel }: Props) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender>('Male')
  const [race, setRace] = useState<Race | null>(null)
  const [klass, setKlass] = useState<CharClass | null>(null)
  const [pool, setPool] = useState<number[]>([])
  const [slots, setSlots] = useState<Slots>({ ...EMPTY })
  const [backstory, setBackstory] = useState('')
  const [companions, setCompanions] = useState<CompanionDraft[]>([])
  const [mode, setMode] = useState<BackstoryMode>('flavor')

  const usedIndices = ABILITY_KEYS.map((k) => slots[k]).filter((v): v is number => v !== null)

  const finalScores = useMemo<AbilityScores | null>(() => {
    if (!race || pool.length < 6) return null
    const out = {} as AbilityScores
    for (const k of ABILITY_KEYS) {
      const idx = slots[k]
      if (idx === null) return null
      out[k] = pool[idx] + (race.bonuses[k] ?? 0)
    }
    return out
  }, [slots, pool, race])

  function onRolled(scores: number[]): void {
    setPool(scores)
    setSlots({ ...EMPTY })
  }

  function setSlot(key: AbilityKey, idx: number | null): void {
    setSlots((prev) => {
      const next = { ...prev }
      if (idx !== null) for (const k of ABILITY_KEYS) if (next[k] === idx) next[k] = null
      next[key] = idx
      return next
    })
  }

  function autoAssign(): void {
    if (!klass || pool.length < 6) return
    const byValueDesc = [...pool.keys()].sort((a, b) => pool[b] - pool[a])
    const order: AbilityKey[] = [klass.primary, ...ABILITY_KEYS.filter((k) => k !== klass.primary)]
    const next = { ...EMPTY }
    order.forEach((k, i) => (next[k] = byValueDesc[i]))
    setSlots(next)
  }

  function addCompanion(): void {
    if (companions.length >= 3) return
    setCompanions((prev) => [
      ...prev,
      { id: Date.now() + prev.length, name: '', gender: 'Female', classId: CLASSES[0].id }
    ])
  }

  function updateCompanion(id: number, patch: Partial<CompanionDraft>): void {
    setCompanions((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  function removeCompanion(id: number): void {
    setCompanions((prev) => prev.filter((c) => c.id !== id))
  }

  function finish(): void {
    if (!name.trim() || !race || !klass || !finalScores) return
    const maxHp = klass.hitDie + abilityMod(finalScores.con)
    const start = CLASS_FEATURES[klass.id]
    const character: Character = {
      name: name.trim(),
      gender,
      raceName: race.name,
      className: klass.name,
      level: 1,
      hp: maxHp,
      maxHp,
      abilities: finalScores,
      ac: 10 + abilityMod(finalScores.dex),
      backstory: backstory.trim() || undefined,
      conditions: [],
      features: start?.features,
      spellSlots: start?.spellSlots,
      // The Ring of Quality Assurance always starts equipped (debug / wishes).
      inventory: [
        { name: 'The Ring of Quality Assurance', note: 'Grants its bearer unlimited wishes.' }
      ]
    }
    const party = companions.filter((c) => c.name.trim()).map(makePartyMember)
    onComplete(character, party, mode)
  }

  const canAdvance = [
    name.trim().length > 0,
    race !== null,
    klass !== null,
    finalScores !== null,
    true, // story optional
    true // party optional
  ]

  return (
    <div className="creation">
      <div className="creation-card">
        <Stepper step={step} />

        {step === 0 && (
          <section>
            <h2>Name your hero</h2>
            <input
              className="text-input"
              autoFocus
              value={name}
              placeholder="e.g. Brannor Stoneheart"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canAdvance[0] && setStep(1)}
            />
            <h3 className="sub-label">Gender</h3>
            <div className="choice-row">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  className={`chip-btn ${gender === g ? 'selected' : ''}`}
                  onClick={() => setGender(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 1 && (
          <section>
            <h2>Choose a race</h2>
            <div className="card-grid">
              {RACES.map((r) => (
                <button
                  key={r.id}
                  className={`pick ${race?.id === r.id ? 'selected' : ''}`}
                  onClick={() => setRace(r)}
                >
                  <strong>{r.name}</strong>
                  <span>{r.description}</span>
                  <em>{bonusText(r)}</em>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2>Choose a class</h2>
            <div className="card-grid">
              {CLASSES.map((c) => (
                <button
                  key={c.id}
                  className={`pick ${klass?.id === c.id ? 'selected' : ''}`}
                  onClick={() => setKlass(c)}
                >
                  <strong>{c.name}</strong>
                  <span>{c.description}</span>
                  <em>
                    d{c.hitDie} Hit Die · {ABILITY_LABELS[c.primary]}
                  </em>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2>Roll your ability scores</h2>
            <p className="hint">
              Roll 4d6 and drop the lowest, six times. Assign each result — racial bonuses are added
              automatically. Re-roll as often as you like.
            </p>
            <DiceRoller onRolled={onRolled} hasRolled={pool.length > 0} />

            {pool.length === 6 && (
              <>
                <div className="row-between">
                  <div className="pool">
                    {pool.map((v, i) => (
                      <span key={i} className={`pool-chip ${usedIndices.includes(i) ? 'used' : ''}`}>
                        {v}
                      </span>
                    ))}
                  </div>
                  <button className="btn small" onClick={autoAssign}>
                    Auto-assign
                  </button>
                </div>
                <div className="assign-grid">
                  {ABILITY_KEYS.map((k) => {
                    const idx = slots[k]
                    const bonus = race?.bonuses[k] ?? 0
                    const total = idx === null ? null : pool[idx] + bonus
                    return (
                      <div key={k} className="assign-row">
                        <span className="assign-label">{ABILITY_LABELS[k]}</span>
                        <select
                          className="select"
                          value={idx ?? ''}
                          onChange={(e) =>
                            setSlot(k, e.target.value === '' ? null : Number(e.target.value))
                          }
                        >
                          <option value="">—</option>
                          {pool.map((v, i) => (
                            <option key={i} value={i} disabled={usedIndices.includes(i) && idx !== i}>
                              {v}
                            </option>
                          ))}
                        </select>
                        <span className="assign-bonus">{bonus ? `+${bonus}` : ''}</span>
                        <span className="assign-total">
                          {total !== null ? `${total} (${formatMod(total)})` : ''}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </section>
        )}

        {step === 4 && (
          <section>
            <h2>Backstory &amp; personality</h2>
            <p className="hint">
              Optional. Who is {name || 'your hero'}? Their past, fears, goals, manner of speaking —
              anything you want the Dungeon Master to know. You&apos;ll choose how heavily it&apos;s
              used on the final step.
            </p>
            <textarea
              className="story-input"
              value={backstory}
              placeholder="A disgraced knight haunted by a betrayal in the mists, terse and watchful, searching for a way home…"
              onChange={(e) => setBackstory(e.target.value)}
            />
          </section>
        )}

        {step === 5 && (
          <section>
            <div className="row-between">
              <h2>Build your party</h2>
              <button className="btn small" disabled={companions.length >= 3} onClick={addCompanion}>
                + Add companion
              </button>
            </div>
            <p className="hint">
              Optional — up to 3 companions who travel and roleplay alongside you. Leave empty to
              adventure alone.
            </p>
            {companions.length === 0 && <p className="empty-note">No companions yet.</p>}
            <div className="companion-list">
              {companions.map((c) => (
                <div key={c.id} className="companion-row">
                  <input
                    className="text-input small-input"
                    value={c.name}
                    placeholder="Name"
                    onChange={(e) => updateCompanion(c.id, { name: e.target.value })}
                  />
                  <button
                    className="btn small"
                    title="Random name"
                    onClick={() => updateCompanion(c.id, { name: randomName(c.gender) })}
                  >
                    🎲
                  </button>
                  <select
                    className="select"
                    value={c.gender}
                    onChange={(e) => updateCompanion(c.id, { gender: e.target.value as Gender })}
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <select
                    className="select"
                    value={c.classId}
                    onChange={(e) => updateCompanion(c.id, { classId: e.target.value })}
                  >
                    {CLASSES.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.name}
                      </option>
                    ))}
                  </select>
                  <button className="btn small ghost" onClick={() => removeCompanion(c.id)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {step === 6 && race && klass && finalScores && (
          <section>
            <h2>Ready to begin</h2>
            <p className="review">
              <strong>{name}</strong> — {gender} · level 1 {race.name} {klass.name}.
            </p>
            <p className="review">
              HP {klass.hitDie + abilityMod(finalScores.con)} · AC {10 + abilityMod(finalScores.dex)}{' '}
              · {ABILITY_KEYS.map((k) => `${k.toUpperCase()} ${finalScores[k]}`).join(', ')}
            </p>
            {companions.filter((c) => c.name.trim()).length > 0 && (
              <p className="review">
                Party:{' '}
                {companions
                  .filter((c) => c.name.trim())
                  .map((c) => `${c.name} (${CLASSES.find((cl) => cl.id === c.classId)?.name})`)
                  .join(', ')}
              </p>
            )}

            {backstory.trim() && (
              <>
                <h3 className="sub-label">How should the DM use your backstory?</h3>
                <div className="choice-row">
                  <button
                    className={`chip-btn wide ${mode === 'active' ? 'selected' : ''}`}
                    onClick={() => setMode('active')}
                  >
                    <strong>Actively weave it in</strong>
                    <span>Hooks, callbacks, NPCs tied to your past</span>
                  </button>
                  <button
                    className={`chip-btn wide ${mode === 'flavor' ? 'selected' : ''}`}
                    onClick={() => setMode('flavor')}
                  >
                    <strong>Subtle flavor only</strong>
                    <span>Color and tone, no driving plot</span>
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        <div className="creation-nav">
          <button className="btn" onClick={() => (step === 0 ? onCancel() : setStep(step - 1))}>
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < 6 ? (
            <button
              className="btn primary"
              disabled={!canAdvance[step]}
              onClick={() => setStep(step + 1)}
            >
              Next
            </button>
          ) : (
            <button className="btn primary" onClick={finish}>
              Enter Barovia
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function bonusText(r: Race): string {
  return Object.entries(r.bonuses)
    .map(([k, v]) => `${k.toUpperCase()} +${v}`)
    .join(', ')
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="stepper">
      {STEPS.map((l, i) => (
        <div key={l} className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
          <span className="step-dot">{i + 1}</span>
          {l}
        </div>
      ))}
    </div>
  )
}
