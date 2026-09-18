import type { CSSProperties } from 'react'
import { getLook, type PortraitMood } from '../game/looks'

interface Props {
  characterId: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  mood?: PortraitMood
  speaking?: boolean
  className?: string
  showName?: boolean
  name?: string
}

const KNOWN = [
  'alina',
  'igor',
  'marina',
  'timur',
  'olga',
  'sergey',
  'daria',
  'pavel',
  'lena',
  'nikita',
  'vera',
  'anton',
  'sofia',
  'roman',
  'kira',
  'gleb',
] as const

/** Премиум-портрет: AI-арт + живая анимация рамки и настроения */
export function CharacterPortrait({
  characterId,
  size = 'md',
  mood = 'idle',
  speaking = false,
  className = '',
  showName = false,
  name,
}: Props) {
  const id = resolveId(characterId)
  const look = getLook(id)
  const src = `/characters/${id}.png`

  return (
    <div
      className={`portrait photo size-${size} mood-${mood} ${speaking ? 'speaking' : ''} ${className}`}
      style={{ '--accent': look.accent, '--bg': look.bg } as CSSProperties}
      aria-hidden="true"
    >
      <div className="portrait-frame">
        <div className="portrait-shine" />
        <img src={src} alt="" className="portrait-img" draggable={false} />
        <div className="portrait-vignette" />
        <div className="portrait-rim" />
        {speaking && <div className="portrait-speak" />}
        {mood === 'win' && <div className="portrait-win-glow" />}
      </div>
      {showName && name && <span className="portrait-caption">{name}</span>}
    </div>
  )
}

function resolveId(raw: string): string {
  if ((KNOWN as readonly string[]).includes(raw)) return raw
  const name = raw.replace(' (ИИ)', '').trim().toLowerCase()
  const map: Record<string, string> = {
    алина: 'alina',
    игорь: 'igor',
    марина: 'marina',
    тимур: 'timur',
    ольга: 'olga',
    сергей: 'sergey',
    дарья: 'daria',
    павел: 'pavel',
    елена: 'lena',
    никита: 'nikita',
    вера: 'vera',
    антон: 'anton',
    софия: 'sofia',
    роман: 'roman',
    кира: 'kira',
    глеб: 'gleb',
  }
  return map[name] ?? 'alina'
}
