import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { BOARD, BOARD_SIZE, MONTH_NAMES, kindLabel } from '../game/board'
import { moodFromPlayer } from '../game/mood'
import type { CellKind, GameState } from '../game/types'
import { CharacterPortrait } from './CharacterPortrait'

interface Props {
  state: GameState
  rolling?: boolean
}

const CX = 200
const CY = 200
const R_OUTER = 180
const R_INNER = 116
const R_TOKEN = (R_INNER + R_OUTER) / 2
const R_LABEL = 195
const R_ICON = (R_INNER + R_OUTER) / 2

function polar(angleDeg: number, r: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r }
}

function arcPath(i: number, total: number, r0: number, r1: number) {
  const a0 = (i / total) * 360
  const a1 = ((i + 1) / total) * 360
  const p0 = polar(a0, r1)
  const p1 = polar(a1, r1)
  const p2 = polar(a1, r0)
  const p3 = polar(a0, r0)
  const large = a1 - a0 > 180 ? 1 : 0
  return [
    `M ${p0.x} ${p0.y}`,
    `A ${r1} ${r1} 0 ${large} 1 ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${r0} ${r0} 0 ${large} 0 ${p3.x} ${p3.y}`,
    'Z',
  ].join(' ')
}

const KIND_GRAD: Record<CellKind, [string, string]> = {
  news: ['#7eb6ff', '#2a6dff'],
  routine: ['#ffb86a', '#e07a28'],
  education: ['#ffe08a', '#e0b03a'],
  opportunity: ['#5dffb0', '#22c97a'],
  dayoff: ['#5ce8ef', '#1fb8c4'],
  event: ['#ff7a8a', '#e83d55'],
  month: ['#3d6b64', '#1a3531'],
}

const KIND_NEON: Record<CellKind, string> = {
  news: '#5b9fff',
  routine: '#ff9a3d',
  education: '#f0c75a',
  opportunity: '#3ecf9a',
  dayoff: '#3ad4dc',
  event: '#ff5c72',
  month: '#8ecfc0',
}

const KIND_ICON: Record<CellKind, string> = {
  news: '◆',
  routine: '●',
  education: '★',
  opportunity: '▲',
  dayoff: '✧',
  event: '✦',
  month: '◈',
}

export function Board({ state, rolling }: Props) {
  const active = state.players[state.activeIndex]
  const cell = BOARD[active?.position ?? 0]
  const [trail, setTrail] = useState<Set<number>>(new Set())
  const [displayPos, setDisplayPos] = useState(active?.position ?? 0)
  const [landPulse, setLandPulse] = useState(false)
  const [stepTick, setStepTick] = useState(0)
  const animRef = useRef<number | null>(null)
  const prevPos = useRef(active?.position ?? 0)

  useEffect(() => {
    if (!active || active.lastRoll == null) {
      setDisplayPos(active?.position ?? 0)
      return
    }
    const to = active.position
    const from = prevPos.current
    if (from === to) {
      setDisplayPos(to)
      return
    }

    const roll = active.lastRoll
    const steps: number[] = []
    for (let s = 1; s <= roll; s++) {
      steps.push((from + s) % BOARD_SIZE)
    }
    if (steps[steps.length - 1] !== to) {
      setDisplayPos(to)
      prevPos.current = to
      return
    }

    setTrail(new Set(steps))
    setLandPulse(false)
    let i = 0
    if (animRef.current) window.clearInterval(animRef.current)
    setDisplayPos(from)
    animRef.current = window.setInterval(() => {
      setDisplayPos(steps[i])
      setStepTick((t) => t + 1)
      i++
      if (i >= steps.length) {
        if (animRef.current) window.clearInterval(animRef.current)
        animRef.current = null
        prevPos.current = to
        setLandPulse(true)
        window.setTimeout(() => setLandPulse(false), 700)
        window.setTimeout(() => setTrail(new Set()), 650)
      }
    }, 85)

    return () => {
      if (animRef.current) window.clearInterval(animRef.current)
    }
  }, [active?.position, active?.lastRoll, active?.id])

  useEffect(() => {
    if (active && active.lastRoll == null) {
      prevPos.current = active.position
      setDisplayPos(active.position)
    }
  }, [active?.id])

  const tokenAngle = ((displayPos + 0.5) / BOARD_SIZE) * 360
  const currentKind = BOARD[displayPos]?.kind ?? cell.kind
  const neon = KIND_NEON[currentKind]
  const moving = trail.size > 0

  return (
    <section
      className={`board-panel ring-board neon-board ${rolling ? 'is-rolling' : ''} ${moving ? 'is-moving' : ''} ${landPulse ? 'is-landing' : ''}`}
      aria-label="Круг года"
      style={{ '--cell-neon': neon } as CSSProperties}
    >
      <div className="board-legend">
        {(Object.keys(KIND_GRAD) as CellKind[]).map((k) => (
          <span key={k} className={`legend-chip neon-${k}`}>
            <i
              style={{
                background: `linear-gradient(135deg, ${KIND_GRAD[k][0]}, ${KIND_GRAD[k][1]})`,
                boxShadow: `0 0 8px ${KIND_NEON[k]}`,
              }}
            />
            {kindLabel(k)}
          </span>
        ))}
      </div>

      <div className="ring-wrap" data-step={stepTick}>
        <div className="ring-neon-aura" aria-hidden="true" />
        <div className="ring-neon-orbit o1" aria-hidden="true" />
        <div className="ring-neon-orbit o2" aria-hidden="true" />
        <div className="ring-energy" aria-hidden="true" />
        <div className="ring-sparks" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} style={{ '--i': i } as CSSProperties} />
          ))}
        </div>
        <div
          className={`ring-spotlight ${rolling || moving ? 'spinning' : ''}`}
          style={{
            transform: `translate(-50%, -50%) rotate(${tokenAngle}deg)`,
          }}
          aria-hidden="true"
        />
        <div
          className="ring-beam"
          style={{ transform: `translate(-50%, -50%) rotate(${tokenAngle}deg)` }}
          aria-hidden="true"
        />

        <svg
          className="ring-svg"
          viewBox="0 0 400 400"
          role="img"
          aria-label="Игровое кольцо из 84 клеток"
        >
          <defs>
            <radialGradient id="hubGrad" cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#3a7a6e" />
              <stop offset="45%" stopColor="#163a34" />
              <stop offset="100%" stopColor="#071614" />
            </radialGradient>
            <linearGradient id="rimGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff0b8" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#e0b03a" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#3ecf9a" stopOpacity="0.9" />
            </linearGradient>
            <filter id="neonSoft" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="neonHot" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="hubGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {(Object.keys(KIND_GRAD) as CellKind[]).map((k) => (
              <linearGradient
                key={k}
                id={`g-${k}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={KIND_GRAD[k][0]} />
                <stop offset="100%" stopColor={KIND_GRAD[k][1]} />
              </linearGradient>
            ))}
          </defs>

          {/* внешние неоновые риски */}
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i / 60) * 360
            const outer = polar(a, R_OUTER + 16)
            const inner = polar(a, R_OUTER + (i % 5 === 0 ? 7 : 11))
            return (
              <line
                key={i}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={i % 5 === 0 ? 'rgba(243,226,168,0.55)' : 'rgba(62,207,154,0.22)'}
                strokeWidth={i % 5 === 0 ? 1.8 : 0.7}
                className="tick-line"
              />
            )
          })}

          <circle
            className="ring-halo"
            cx={CX}
            cy={CY}
            r={R_OUTER + 12}
            fill="none"
            stroke="url(#rimGold)"
            strokeWidth="3"
            filter="url(#neonSoft)"
          />
          <circle
            className="ring-halo-inner"
            cx={CX}
            cy={CY}
            r={R_INNER - 1}
            fill="none"
            stroke={neon}
            strokeWidth="1.5"
            opacity="0.55"
            filter="url(#neonSoft)"
          />

          {BOARD.map((c, i) => {
            const isActiveHere = displayPos === c.id
            const onTrail = trail.has(c.id)
            const mid = polar(((i + 0.5) / BOARD_SIZE) * 360, R_ICON)
            const showGlyph = c.kind === 'month' || i % 2 === 0 || isActiveHere || onTrail
            return (
              <g
                key={c.id}
                className={`cell-group kind-${c.kind} ${isActiveHere ? 'is-active' : ''} ${onTrail ? 'is-trail' : ''}`}
              >
                <path
                  d={arcPath(i, BOARD_SIZE, R_INNER, R_OUTER)}
                  fill={`url(#g-${c.kind})`}
                  className="ring-cell"
                  filter={
                    isActiveHere
                      ? 'url(#neonHot)'
                      : onTrail
                        ? 'url(#neonSoft)'
                        : undefined
                  }
                  opacity={c.kind === 'month' ? 0.92 : isActiveHere ? 1 : 0.9}
                  stroke={isActiveHere ? neon : 'rgba(4,14,12,0.65)'}
                  strokeWidth={isActiveHere ? 2.2 : 0.65}
                >
                  <title>
                    {c.label} · {kindLabel(c.kind)}
                  </title>
                </path>
                {showGlyph && (
                  <text
                    x={mid.x}
                    y={mid.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`cell-glyph ${isActiveHere ? 'on' : ''}`}
                    fontSize={isActiveHere ? 10 : c.kind === 'month' ? 7 : 6}
                    fill={isActiveHere ? '#fff' : 'rgba(255,255,255,0.72)'}
                    style={isActiveHere ? { filter: `drop-shadow(0 0 4px ${neon})` } : undefined}
                  >
                    {KIND_ICON[c.kind]}
                  </text>
                )}
              </g>
            )
          })}

          {MONTH_NAMES.map((name, mi) => {
            const mid = mi * 7 + 0.5
            const angle = (mid / BOARD_SIZE) * 360
            const p = polar(angle, R_LABEL)
            const on = Math.floor(displayPos / 7) === mi
            return (
              <text
                key={name}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`month-label ${on ? 'on' : ''}`}
                transform={`rotate(${angle}, ${p.x}, ${p.y})`}
              >
                {name.slice(0, 3)}
              </text>
            )
          })}

          <circle
            cx={CX}
            cy={CY}
            r={R_INNER - 3}
            fill="url(#hubGrad)"
            filter="url(#hubGlow)"
          />
          <circle
            cx={CX}
            cy={CY}
            r={R_INNER - 3}
            fill="none"
            stroke="rgba(243,226,168,0.35)"
            strokeWidth="1.8"
          />
          <circle
            cx={CX}
            cy={CY}
            r={R_INNER - 16}
            fill="none"
            stroke={neon}
            strokeWidth="1.2"
            strokeDasharray="4 6"
            className="hub-dash"
            opacity="0.65"
          />
        </svg>

        <div className="token-layer">
          {state.players
            .map((p, idx) => ({ p, idx }))
            .filter(({ p }) => p.alive)
            .map(({ p, idx }) => {
              const pos = idx === state.activeIndex ? displayPos : p.position
              const angle = ((pos + 0.5) / BOARD_SIZE) * 360
              const spot = polar(angle, R_TOKEN)
              const left = (spot.x / 400) * 100
              const top = (spot.y / 400) * 100
              const isActive = idx === state.activeIndex
              return (
                <div
                  key={p.id}
                  className={`token-html token-portrait t${idx} ${isActive ? 'is-active' : ''} ${rolling && isActive ? 'is-flying' : ''} ${moving && isActive ? 'is-hopping' : ''} ${landPulse && isActive ? 'is-land' : ''}`}
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    transitionDuration: isActive && moving ? '0.07s' : '0.5s',
                    ['--token-neon' as string]: isActive ? neon : undefined,
                  }}
                  title={p.name}
                >
                  <span className="token-aura" aria-hidden="true" />
                  <CharacterPortrait
                    characterId={p.characterId}
                    size="sm"
                    mood={moodFromPlayer(p)}
                  />
                </div>
              )
            })}
        </div>

        <div className={`ring-hub kind-${currentKind}`}>
          <div className="hub-pulse" aria-hidden="true" />
          <div className="hub-ring-spin" aria-hidden="true" />
          {active && (
            <CharacterPortrait
              characterId={active.characterId}
              size="md"
              mood={moodFromPlayer(active)}
              speaking={Boolean(active.pendingEvent) || moving}
              className="hub-portrait"
              showName
              name={active.name.replace(' (ИИ)', '')}
            />
          )}
          <p className="hub-cell">
            <span className="hub-pill neon">
              {KIND_ICON[currentKind]} {kindLabel(currentKind)}
            </span>
          </p>
          <p className="hub-eyebrow">{BOARD[displayPos]?.label ?? cell.label}</p>
          <p className="hub-meta">
            <span className="hub-pill muted">
              {displayPos + 1}/{BOARD_SIZE}
            </span>
            {active?.lastRoll != null && (
              <span className="hub-pill neon">🎲 {active.lastRoll}</span>
            )}
          </p>
        </div>
      </div>

      <div className="month-rail">
        {MONTH_NAMES.map((name, mi) => {
          const onMonth = Math.floor(displayPos / 7) === mi
          return (
            <span
              key={name}
              className={`rail-pip ${onMonth ? 'on' : ''}`}
              title={name}
            >
              {name.slice(0, 1)}
            </span>
          )
        })}
      </div>
    </section>
  )
}
