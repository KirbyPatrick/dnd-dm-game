import type { ReactElement } from 'react'
import type { SpriteDef } from '@renderer/data/sprites'

interface Props {
  def: SpriteDef
  size?: number
}

/** Render a grid sprite as crisp, scalable SVG rects. */
export function PixelSprite({ def, size = 72 }: Props) {
  const height = def.rows.length
  const width = def.rows.reduce((m, r) => Math.max(m, r.length), 0)
  const cells: ReactElement[] = []

  for (let y = 0; y < height; y++) {
    const row = def.rows[y]
    for (let x = 0; x < row.length; x++) {
      const color = def.palette[row[x]]
      if (!color) continue // '.' and unknown chars are transparent
      // 1.02 overlap hides hairline seams between rects.
      cells.push(
        <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={color} />
      )
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated' }}
      aria-hidden="true"
    >
      {cells}
    </svg>
  )
}
