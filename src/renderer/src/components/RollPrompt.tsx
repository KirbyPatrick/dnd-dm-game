import { useEffect, useRef, useState } from 'react'
import { abilityMod, proficiencyBonus, type Character, type RollRequest } from '@renderer/state/types'

function d20(): number {
  return 1 + Math.floor(Math.random() * 20)
}

function computeModifier(req: RollRequest, char: Character, level: number): number {
  if (req.modifier !== undefined) return req.modifier
  let m = req.ability ? abilityMod(char.abilities[req.ability]) : 0
  if (req.proficient) m += proficiencyBonus(level)
  return m
}

interface Props {
  request: RollRequest
  character: Character
  level: number
  onRoll: (message: string) => void
}

// How long the landed result stays on screen before the turn is sent.
const SETTLE_MS = 1100

export function RollPrompt({ request, character, level, onRoll }: Props) {
  const [rolling, setRolling] = useState(false)
  const [face, setFace] = useState(20)
  const [landed, setLanded] = useState<{ d20: number; total: number } | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current)
      if (settle.current) clearTimeout(settle.current)
    },
    []
  )

  const mod = computeModifier(request, character, level)
  const modStr = `${mod >= 0 ? '+' : ''}${mod}`

  function roll(): void {
    if (rolling || landed) return
    setRolling(true)
    let ticks = 0
    timer.current = setInterval(() => {
      setFace(d20())
      ticks += 1
      if (ticks >= 14) {
        if (timer.current) clearInterval(timer.current)
        const result = d20()
        const total = result + mod
        setFace(result)
        setRolling(false)
        setLanded({ d20: result, total }) // hold on the number for a beat
        const dcPart = request.dc !== undefined ? ` vs DC ${request.dc}` : ''
        const verdict =
          request.dc !== undefined ? (total >= request.dc ? ' — Success' : ' — Failure') : ''
        const message = `🎲 ${request.label}: d20 (${result}) ${modStr} = ${total}${dcPart}${verdict}`
        settle.current = setTimeout(() => onRoll(message), SETTLE_MS)
      }
    }, 55)
  }

  return (
    <div className="roll-prompt">
      <div className={`d20 ${rolling ? 'rolling' : ''} ${landed ? 'landed' : ''}`}>{face}</div>
      <div className="roll-prompt-info">
        <div className="roll-prompt-label">
          {request.label}
          {request.dc !== undefined ? ` · DC ${request.dc}` : ''}
        </div>
        <div className="roll-prompt-mod">
          {landed
            ? `d20 (${landed.d20}) ${modStr} = ${landed.total}`
            : `${request.who} rolls · modifier ${modStr}`}
        </div>
      </div>
      <button className="btn primary roll-prompt-btn" disabled={rolling || !!landed} onClick={roll}>
        {landed ? `Rolled ${landed.total}!` : rolling ? 'Rolling…' : '🎲 Roll d20'}
      </button>
    </div>
  )
}
