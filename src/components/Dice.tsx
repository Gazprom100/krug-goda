import { useEffect, useState } from 'react'

interface Props {
  value: number | null
  rolling?: boolean
  size?: 'md' | 'lg'
}

const FACES: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [
    [30, 30],
    [70, 70],
  ],
  3: [
    [30, 30],
    [50, 50],
    [70, 70],
  ],
  4: [
    [30, 30],
    [70, 30],
    [30, 70],
    [70, 70],
  ],
  5: [
    [30, 30],
    [70, 30],
    [50, 50],
    [30, 70],
    [70, 70],
  ],
  6: [
    [30, 30],
    [70, 30],
    [30, 50],
    [70, 50],
    [30, 70],
    [70, 70],
  ],
}

export function Dice({ value, rolling, size = 'md' }: Props) {
  const [display, setDisplay] = useState(value ?? 1)

  useEffect(() => {
    if (!rolling) {
      if (value != null) setDisplay(value)
      return
    }
    let n = 0
    const id = window.setInterval(() => {
      setDisplay(1 + Math.floor(Math.random() * 6))
      n++
      if (n > 12) window.clearInterval(id)
    }, 45)
    return () => window.clearInterval(id)
  }, [rolling, value])

  const pips = FACES[display] ?? FACES[1]

  return (
    <div
      className={`dice ${size} ${rolling ? 'is-rolling' : ''}`}
      aria-label={value != null ? `Кубик: ${value}` : 'Кубик'}
    >
      <div className="dice-shadow" aria-hidden="true" />
      <div className="dice-face">
        <span className="dice-sheen" aria-hidden="true" />
        {pips.map(([x, y], i) => (
          <span
            key={i}
            className="pip"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        ))}
      </div>
    </div>
  )
}
