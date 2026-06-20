import { useEffect, useRef, useState } from 'react'

function d6(): number {
  return 1 + Math.floor(Math.random() * 6)
}

/** Roll 4d6, drop the lowest die. */
function roll4d6DropLowest(): number {
  const dice = [d6(), d6(), d6(), d6()].sort((a, b) => a - b)
  return dice[1] + dice[2] + dice[3]
}

// Pip positions in a 3x3 grid (index 0-8) for each die face.
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
}

function Die({ value, rolling }: { value: number; rolling: boolean }) {
  const lit = new Set(PIPS[value] ?? [])
  return (
    <div className={`die ${rolling ? 'tumble' : ''}`}>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={`pip ${lit.has(i) ? 'on' : ''}`} />
      ))}
    </div>
  )
}

interface Props {
  onRolled: (scores: number[]) => void
  hasRolled: boolean
}

export function DiceRoller({ onRolled, hasRolled }: Props) {
  const [rolling, setRolling] = useState(false)
  const [faces, setFaces] = useState([6, 4, 2, 5])
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  // Clean up the tumble interval if we unmount mid-roll.
  useEffect(() => () => void (timer.current && clearInterval(timer.current)), [])

  function roll(): void {
    if (rolling) return
    setRolling(true)
    let ticks = 0
    timer.current = setInterval(() => {
      setFaces([d6(), d6(), d6(), d6()])
      ticks += 1
      if (ticks >= 12) {
        if (timer.current) clearInterval(timer.current)
        setFaces([d6(), d6(), d6(), d6()])
        setRolling(false)
        onRolled(Array.from({ length: 6 }, roll4d6DropLowest))
      }
    }, 60)
  }

  return (
    <div className="dice-roller">
      <div className="dice-tray">
        {faces.map((f, i) => (
          <Die key={i} value={f} rolling={rolling} />
        ))}
      </div>
      <button className="btn primary roll-btn" onClick={roll} disabled={rolling}>
        {rolling ? 'Rolling…' : hasRolled ? '🎲 Re-roll' : '🎲 Roll'}
      </button>
    </div>
  )
}
