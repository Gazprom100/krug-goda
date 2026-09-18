import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  className?: string
  format?: (n: number) => string
}

/** Плавный счётчик с вспышкой при изменении */
export function AnimatedNumber({ value, className, format }: Props) {
  const [shown, setShown] = useState(value)
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)
  const from = useRef(value)

  useEffect(() => {
    const start = from.current
    const end = value
    from.current = value
    if (start === end) {
      setShown(end)
      return
    }
    setFlash(end > start ? 'up' : 'down')
    const tFlash = window.setTimeout(() => setFlash(null), 500)
    const t0 = performance.now()
    const dur = 520
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur)
      const eased = 1 - (1 - p) ** 3
      setShown(Math.round(start + (end - start) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(tFlash)
    }
  }, [value])

  return (
    <span className={`anim-num ${flash ? `flash-${flash}` : ''} ${className ?? ''}`}>
      {format ? format(shown) : shown.toLocaleString('ru-RU')}
    </span>
  )
}
