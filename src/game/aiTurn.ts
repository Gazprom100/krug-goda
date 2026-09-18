import { pickAiChoice, pickAiWorkMode, shouldBuyDream } from './ai'
import {
  applyChoice,
  buyDreamManual,
  rollDice,
  setToast,
  setWorkMode,
} from './engine'
import type { GameState } from './types'

/** Один шаг автохода ИИ. Возвращает новое состояние. */
export function stepAi(state: GameState): GameState {
  if (state.phase !== 'playing') return state
  const p = state.players[state.activeIndex]
  if (!p?.isAi || !p.alive || p.won) return state

  if (p.pendingEvent) {
    const choice = pickAiChoice(p)
    return applyChoice(state, choice)
  }

  const mode = pickAiWorkMode(p)
  if (mode) {
    let next = setWorkMode(state, mode)
    next = setToast(next, `${p.name} меняет режим работы`)
    return next
  }

  if (shouldBuyDream(p)) {
    let next = buyDreamManual(state)
    next = setToast(next, `${p.name} покупает мечту`)
    return next
  }

  let next = rollDice(state)
  const after = next.players[state.activeIndex]
  next = setToast(
    next,
    after?.lastRoll != null
      ? `${p.name} бросает ${after.lastRoll}`
      : `${p.name} ходит`,
  )
  return next
}
