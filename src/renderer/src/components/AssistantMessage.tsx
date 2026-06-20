import type { Ref } from 'react'
import { stripGameBlocks } from '@renderer/state/types'

function toLines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l !== '')
}

interface Props {
  content: string
  animate: boolean // only the newest DM reply fades in
  anchorRef?: Ref<HTMLDivElement>
}

// Renders DM prose as paragraphs with 🎲 roll lines pulled onto their own rows.
// When `animate`, each line fades in sequentially (0.25s each).
export function AssistantMessage({ content, animate, anchorRef }: Props) {
  const lines = toLines(stripGameBlocks(content))
  return (
    <div className="bubble assistant" ref={anchorRef}>
      {lines.map((line, i) => {
        const cls = animate ? 'fade-seq' : ''
        const style = animate ? { animationDelay: `${i * 0.25}s` } : undefined
        return line.startsWith('🎲') ? (
          <div key={i} className={`roll-line ${cls}`} style={style}>
            {line}
          </div>
        ) : (
          <p key={i} className={`narr ${cls}`} style={style}>
            {line}
          </p>
        )
      })}
    </div>
  )
}
