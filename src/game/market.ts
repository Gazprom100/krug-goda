import { BALANCE } from './balance'
import type { Asset, MarketState, PlayerState } from './types'

export function createMarket(): MarketState {
  return {
    stocks: 1,
    realty: 1,
    crypto: 1,
    art: 1,
    metals: 1,
    crisisCooldown: 0,
  }
}

function jitter(v: number, amp: number): number {
  return Math.max(0.35, v * (1 + (Math.random() * 2 - 1) * amp))
}

export function tickMarket(market: MarketState, crisis: boolean): MarketState {
  let next = { ...market }
  if (crisis) {
    next = {
      ...next,
      stocks: next.stocks * 0.78,
      crypto: next.crypto * 0.6,
      art: next.art * 0.88,
      realty: next.realty * 0.93,
      metals: next.metals * 1.06,
      crisisCooldown: 6,
    }
  } else {
    next = {
      stocks: jitter(next.stocks, 0.05),
      realty: jitter(next.realty, 0.025),
      crypto: jitter(next.crypto, 0.12),
      art: jitter(next.art, 0.06),
      metals: jitter(next.metals, 0.035),
      crisisCooldown: Math.max(0, next.crisisCooldown - 1),
    }
  }
  return next
}

export function repriceAssets(assets: Asset[], market: MarketState): Asset[] {
  return assets.map((a) => {
    const mult =
      a.type === 'stock'
        ? market.stocks
        : a.type === 'realty'
          ? market.realty
          : a.type === 'crypto'
            ? market.crypto
            : a.type === 'art'
              ? market.art
              : a.type === 'metal'
                ? market.metals
                : 1
    const marketValue = Math.round(a.cost * mult * (0.85 + a.quality * 0.1))
    let monthlyIncome = a.monthlyIncome
    if (a.type === 'realty') {
      monthlyIncome = Math.round(
        a.monthlyIncome * BALANCE.realtyIncomeBoost * (0.92 + market.realty * 0.08),
      )
    }
    if (a.type === 'business') {
      monthlyIncome = Math.round(a.monthlyIncome * BALANCE.businessIncomeBoost)
    }
    if (a.type === 'stock') {
      monthlyIncome = Math.round(
        a.cost * market.stocks * BALANCE.stockDivYieldMonthly + a.monthlyIncome * 0.4,
      )
    }
    if (a.quality === 0 && Math.random() < 0.22) {
      return { ...a, marketValue: 0, monthlyIncome: 0 }
    }
    return { ...a, marketValue, monthlyIncome }
  })
}

export function ageTimeCap(age: number, base: number): number {
  const over = Math.max(0, age - 30)
  return Math.max(140, Math.round(base - over * 1.5 - Math.max(0, age - 50) * 1.1))
}

export function applyMarketToPlayer(p: PlayerState, market: MarketState): PlayerState {
  return { ...p, assets: repriceAssets(p.assets, market) }
}
