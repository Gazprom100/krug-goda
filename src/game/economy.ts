import { BALANCE } from './balance'
import type { Asset, PlayerState } from './types'

export function habitCost(p: PlayerState): number {
  return p.habits.reduce((s, h) => s + h.monthlyCost, 0)
}

export function habitTime(p: PlayerState): number {
  return p.habits.reduce((s, h) => s + h.monthlyTime, 0)
}

export function familyExpense(p: PlayerState): number {
  return p.familySize * BALANCE.familyPerPerson
}

export function carExpense(p: PlayerState): number {
  return p.hasCar ? BALANCE.carExpense : 0
}

export function carTimeSave(p: PlayerState): number {
  return p.hasCar ? BALANCE.carTimeSave : 0
}

export function totalExpenses(p: PlayerState): number {
  const basket = Math.max(BALANCE.minBasket, p.baseExpenses + familyExpense(p))
  return (
    basket +
    habitCost(p) +
    carExpense(p) +
    p.liabilities.reduce((s, l) => s + l.monthlyPayment, 0)
  )
}

export function passiveIncome(p: PlayerState): number {
  return p.assets.reduce((s, a) => {
    let inc = a.monthlyIncome
    if (a.type === 'realty') inc = Math.round(inc * BALANCE.realtyIncomeBoost)
    if (a.type === 'business') inc = Math.round(inc * BALANCE.businessIncomeBoost)
    return s + inc
  }, 0)
}

export function workIncome(p: PlayerState): number {
  return p.workMode === 'none' || p.fired ? 0 : p.salary
}

export function totalIncome(p: PlayerState): number {
  return workIncome(p) + passiveIncome(p)
}

export function cashFlow(p: PlayerState): number {
  return totalIncome(p) - totalExpenses(p)
}

export function assetTime(p: PlayerState): number {
  return p.assets.reduce((s, a) => s + a.monthlyTime, 0)
}

export function jobTime(p: PlayerState): number {
  if (p.workMode === 'none' || p.fired) return 0
  return p.jobHours
}

export function timeUsed(p: PlayerState): number {
  return Math.max(
    0,
    jobTime(p) +
      assetTime(p) +
      habitTime(p) +
      p.familySize * BALANCE.familyTimePerPerson -
      carTimeSave(p),
  )
}

export function freeHours(p: PlayerState): number {
  return p.timeCap - timeUsed(p)
}

export function hourlyRate(p: PlayerState): number {
  const hours = Math.max(1, timeUsed(p))
  return Math.round(totalIncome(p) / hours)
}

export function netWorth(p: PlayerState): number {
  const assets = p.assets.reduce((s, a) => s + a.marketValue, 0)
  const debt = p.liabilities.reduce((s, l) => s + l.balance, 0)
  return p.cash + assets - debt
}

export function formatMoney(n: number): string {
  return `${Math.round(n).toLocaleString('ru-RU')} ₽`
}

export function sellValue(asset: Asset, pct: number): number {
  const base =
    asset.type === 'realty'
      ? 0.75
      : asset.type === 'business'
        ? 0.5
        : asset.type === 'stock' || asset.type === 'crypto' || asset.type === 'metal'
          ? 1
          : 0.5
  return Math.round(asset.marketValue * base * pct)
}
