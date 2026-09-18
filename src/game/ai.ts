import { BALANCE } from './balance'
import {
  cashFlow,
  freeHours,
  passiveIncome,
  totalExpenses,
} from './economy'
import type { EventChoice, PlayerState, WorkMode } from './types'
import { filterChoices } from './choices'

/** Оценка выбора для ИИ (чем выше — тем лучше). */
export function scoreChoice(p: PlayerState, c: EventChoice): number {
  let s = 0
  s += (c.cashDelta ?? 0) * 1.0
  s += (c.salaryDelta ?? 0) * 18
  s += (c.eduDelta ?? 0) * 25000
  s += (c.proDelta ?? 0) * 22000
  s += (c.networkDelta ?? 0) * 18000
  s += (c.careerDelta ?? 0) * 20000
  s += (c.expenseDelta ?? 0) * -20
  s += (c.jobHoursDelta ?? 0) * -800

  if (c.addAsset) {
    const a = c.addAsset
    const years = 3
    s +=
      a.monthlyIncome *
      12 *
      years *
      (a.type === 'realty' || a.type === 'business' ? 1.2 : 1)
    s -= a.cost * 0.35
    s -= a.monthlyTime * 3000
    if (a.quality === 0) s -= 80000
    if (a.type === 'crypto') s -= 15000
  }

  if (c.addLiability) {
    s -= c.addLiability.monthlyPayment * 24
    s -= c.addLiability.balance * 0.15
  }

  if (c.fireJob) {
    s += cashFlow(p) < 0 ? 5000 : -60000
  }

  if (c.quitHabitId) s += 35000

  if (c.buyCar && !p.hasCar) {
    s += freeHours(p) < 40 ? 40000 : 10000
  }

  if (c.fulfillDream) {
    if (!p.dreamBought && p.cash >= p.dreamCost) s += 200000
    else s -= 50000
  }

  if (c.sellAssetType) {
    s += p.cash < totalExpenses(p) * 2 ? 30000 : -20000
  }

  if (c.familyDelta && c.familyDelta > 0) {
    s += p.familySize >= 2 ? -25000 : 5000
  }

  if (p.cash + (c.cashDelta ?? 0) < 20000) s -= 40000

  return s
}

export function pickAiChoice(p: PlayerState): EventChoice {
  const event = p.pendingEvent
  if (!event) return { label: 'Пропуск' }
  const choices = filterChoices(p, event)
  let best = choices[0]
  let bestScore = -Infinity
  for (const c of choices) {
    const sc = scoreChoice(p, c) + Math.random() * 5000
    if (sc > bestScore) {
      bestScore = sc
      best = c
    }
  }
  return best
}

export function pickAiWorkMode(p: PlayerState): WorkMode | null {
  if (p.pendingEvent || !p.alive || p.won) return null

  const passive = passiveIncome(p)
  const expenses = totalExpenses(p)
  const free = freeHours(p)

  if (passive >= expenses && p.workMode === 'business') return 'none'

  if (
    passive >= expenses * 0.8 &&
    p.workMode === 'job' &&
    p.eduLevel >= BALANCE.businessEduNeed &&
    p.proSkills >= BALANCE.businessProNeed
  ) {
    return 'business'
  }

  if ((p.fired || p.workMode === 'none') && p.cash < expenses * 3) {
    return 'job'
  }

  if (p.eduLevel >= 1 && free < 45 && p.workMode === 'job') {
    return 'freelance'
  }

  return null
}

export function shouldBuyDream(p: PlayerState): boolean {
  if (p.dreamBought || p.pendingEvent) return false
  if (p.cash < p.dreamCost) return false
  const flowOk = cashFlow(p) > 0
  const timeOk = freeHours(p) >= BALANCE.winFreeHours * 0.7
  const rich = p.cash >= p.dreamCost + BALANCE.winCash * 0.35
  return (flowOk && timeOk) || rich
}
