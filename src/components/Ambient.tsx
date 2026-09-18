import { useEffect, useState, type CSSProperties } from 'react'

/** Кинематографичный фон с параллаксом от курсора */
export function Ambient() {
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 28
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setOffset({ x, y })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const layer = (depth: number): CSSProperties => ({
    transform: `translate(${offset.x * depth}px, ${offset.y * depth}px)`,
  })

  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-wash" />
      <div className="ambient-orb orb-a" style={layer(0.35)} />
      <div className="ambient-orb orb-b" style={layer(0.55)} />
      <div className="ambient-orb orb-c" style={layer(0.25)} />
      <div className="ambient-orb orb-d" style={layer(0.7)} />
      <div className="ambient-ring r1" style={layer(0.15)} />
      <div className="ambient-ring r2" style={layer(0.22)} />
      <div className="ambient-sparks" style={layer(0.4)}>
        {Array.from({ length: 22 }, (_, i) => (
          <span key={i} style={{ '--i': i } as CSSProperties} />
        ))}
      </div>
      <div className="ambient-grain" />
      <div className="ambient-vignette" />
    </div>
  )
}
