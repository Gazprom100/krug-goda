import { cashFlow, freeHours } from '../game/economy'
import type { PortraitMood } from '../game/looks'
import type { PlayerState } from '../game/types'

export function moodFromPlayer(p: PlayerState): PortraitMood {
  if (p.won) return 'win'
  if (!p.alive) return 'tired'
  if (p.cash < 0 || cashFlow(p) < -5000) return 'worried'
  if (freeHours(p) < 20) return 'tired'
  if (cashFlow(p) > 15000 && p.cash > 100000) return 'happy'
  return 'idle'
}
