import { freeHours } from './economy'
import type { EventChoice, GameEvent, PlayerState } from './types'

export function choiceAvailable(p: PlayerState, c: EventChoice): boolean {
  if (c.requireCash != null && p.cash < c.requireCash) return false
  if (c.requireNetwork != null && p.network < c.requireNetwork) return false
  if (c.requireEdu != null && p.eduLevel < c.requireEdu) return false
  if (c.requirePro != null && p.proSkills < c.requirePro) return false
  if (c.requireFreeTime != null && freeHours(p) < c.requireFreeTime) return false
  return true
}

export function filterChoices(p: PlayerState, event: GameEvent): EventChoice[] {
  const ok = event.choices.filter((c) => choiceAvailable(p, c))
  return ok.length ? ok : [{ label: 'Недоступно — пропуск', note: 'Условий нет' }]
}
