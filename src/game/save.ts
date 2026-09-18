import type { GameState } from './types'

const KEY = 'krug-goda-save-v2'

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GameState
    if (!parsed.players?.length) return null
    if (parsed.viewIndex == null) parsed.viewIndex = parsed.activeIndex ?? 0
    if (!parsed.market) return null
    if (parsed.lastToast === undefined) parsed.lastToast = null
    parsed.players = parsed.players.map((p) => ({
      ...p,
      isAi: Boolean(p.isAi),
    }))
    return parsed
  } catch {
    return null
  }
}

export function clearSave(): void {
  localStorage.removeItem(KEY)
}
