import type { CSSProperties } from 'react'

/** Лёгкий салют при победе */
export function VictoryBurst({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="victory-burst" aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => (
        <span key={i} style={{ '--i': i } as CSSProperties} />
      ))}
    </div>
  )
}
