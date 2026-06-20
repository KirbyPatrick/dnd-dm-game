import { useEffect, useRef, useState } from 'react'
import type {
  Character,
  CombatState,
  Enemy,
  Message,
  PartyMember,
  RollRequest
} from '@renderer/state/types'
import { OPENING_PROMPT, type LevelUpSummary } from '@renderer/state/useGame'
import { CharacterSheet } from './CharacterSheet'
import { EnemyPanel } from './EnemyCard'
import { DetailModal, type Selection } from './DetailModal'
import { InitiativeTracker } from './InitiativeTracker'
import { RollPrompt } from './RollPrompt'
import { AssistantMessage } from './AssistantMessage'
import { LevelUpModal } from './LevelUpModal'

interface Props {
  character: Character
  messages: Message[]
  enemies: Enemy[]
  party: PartyMember[]
  combat: CombatState | null
  pendingRoll: RollRequest | null
  xp: number
  level: number
  levelUp: LevelUpSummary | null
  busy: boolean
  error: string | null
  onSend: (text: string) => void
  onDismissLevelUp: () => void
  onQuit: () => void
}

export function GameView({
  character,
  messages,
  enemies,
  party,
  combat,
  pendingRoll,
  xp,
  level,
  levelUp,
  busy,
  error,
  onSend,
  onDismissLevelUp,
  onQuit
}: Props) {
  const [input, setInput] = useState('')
  const [selection, setSelection] = useState<Selection | null>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)

  const visible = messages.filter((m) => m.content !== OPENING_PROMPT)
  const lastIndex = visible.length - 1
  const lastIsAssistant = lastIndex >= 0 && visible[lastIndex].role === 'assistant'

  const subject = resolveSubject(selection, character, party, enemies)

  // On a new DM response, scroll so the TOP of that response is in view.
  useEffect(() => {
    if (lastIsAssistant && topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [visible.length, lastIsAssistant])

  function submit(): void {
    if (!input.trim() || busy) return
    onSend(input)
    setInput('')
  }

  return (
    <div className="game">
      <CharacterSheet
        character={character}
        party={party}
        xp={xp}
        level={level}
        onOpenHero={() => setSelection({ kind: 'hero' })}
        onOpenParty={(name) => setSelection({ kind: 'party', name })}
      />

      <main className="play">
        {combat?.active && <InitiativeTracker combat={combat} />}
        <EnemyPanel enemies={enemies} onOpen={(name) => setSelection({ kind: 'enemy', name })} />

        <div className="log" ref={logRef}>
          {visible.map((m, i) =>
            m.role === 'assistant' ? (
              <AssistantMessage
                key={i}
                content={m.content}
                animate={i === lastIndex}
                anchorRef={i === lastIndex ? topRef : undefined}
              />
            ) : (
              <div key={i} className="bubble user">
                {m.content}
              </div>
            )
          )}

          {busy && (
            <div className="bubble assistant">
              <span className="dots">The Dungeon Master is weaving the tale…</span>
            </div>
          )}

          {error && <div className="bubble error">⚠️ {error}</div>}
        </div>

        {pendingRoll && !busy && (
          <RollPrompt
            request={pendingRoll}
            character={character}
            level={level}
            onRoll={(message) => onSend(message)}
          />
        )}

        <div className="composer">
          <textarea
            className="composer-input"
            placeholder={pendingRoll ? 'Roll above, or type to act…' : 'What do you do?'}
            value={input}
            disabled={busy}
            rows={2}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
          />
          <div className="composer-actions">
            <button className="btn ghost small" onClick={onQuit}>
              Quit
            </button>
            <button className="btn primary" disabled={busy || !input.trim()} onClick={submit}>
              Act
            </button>
          </div>
        </div>
      </main>

      {subject && <DetailModal subject={subject} onClose={() => setSelection(null)} />}
      {levelUp && <LevelUpModal summary={levelUp} onClose={onDismissLevelUp} />}
    </div>
  )
}

type ResolvedSubject =
  | { kind: 'hero'; data: Character }
  | { kind: 'party'; data: PartyMember }
  | { kind: 'enemy'; data: Enemy }

function resolveSubject(
  selection: Selection | null,
  character: Character,
  party: PartyMember[],
  enemies: Enemy[]
): ResolvedSubject | null {
  if (!selection) return null
  if (selection.kind === 'hero') return { kind: 'hero', data: character }
  if (selection.kind === 'party') {
    const m = party.find((p) => p.name === selection.name)
    return m ? { kind: 'party', data: m } : null
  }
  const e = enemies.find((x) => x.name === selection.name)
  return e ? { kind: 'enemy', data: e } : null
}
