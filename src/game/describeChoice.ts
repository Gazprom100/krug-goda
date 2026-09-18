import { formatMoney } from './economy'
import type { EventChoice, PlayerState } from './types'
import { choiceAvailable } from './choices'

export type EffectTone = 'good' | 'bad' | 'neutral' | 'req'

export interface EffectLine {
  text: string
  tone: EffectTone
}

/** Человекочитаемые эффекты выбора для UI */
export function describeChoiceEffects(c: EventChoice): EffectLine[] {
  const lines: EffectLine[] = []

  if (c.cashDelta != null && c.cashDelta !== 0) {
    lines.push({
      text: `${c.cashDelta > 0 ? '+' : ''}${formatMoney(c.cashDelta)} сейчас`,
      tone: c.cashDelta > 0 ? 'good' : 'bad',
    })
  }
  if (c.expenseDelta != null && c.expenseDelta !== 0) {
    lines.push({
      text:
        c.expenseDelta > 0
          ? `Расходы +${formatMoney(c.expenseDelta)}/мес`
          : `Расходы ${formatMoney(c.expenseDelta)}/мес`,
      tone: c.expenseDelta > 0 ? 'bad' : 'good',
    })
  }
  if (c.salaryDelta != null && c.salaryDelta !== 0) {
    lines.push({
      text: `Оклад ${c.salaryDelta > 0 ? '+' : ''}${formatMoney(c.salaryDelta)}/мес`,
      tone: c.salaryDelta > 0 ? 'good' : 'bad',
    })
  }
  if (c.timeDelta != null && c.timeDelta !== 0) {
    lines.push({
      text:
        c.timeDelta > 0
          ? `Свободное время ≈ +${c.timeDelta} ч`
          : `Займёт ≈ ${-c.timeDelta} ч`,
      tone: c.timeDelta > 0 ? 'good' : 'bad',
    })
  }
  if (c.jobHoursDelta != null && c.jobHoursDelta !== 0) {
    lines.push({
      text: `Часы работы ${c.jobHoursDelta > 0 ? '+' : ''}${c.jobHoursDelta}`,
      tone: c.jobHoursDelta > 0 ? 'bad' : 'good',
    })
  }
  if (c.careerDelta != null && c.careerDelta !== 0) {
    lines.push({
      text: `Карьера ${c.careerDelta > 0 ? '+' : ''}${c.careerDelta}`,
      tone: c.careerDelta > 0 ? 'good' : 'bad',
    })
  }
  if (c.eduDelta != null && c.eduDelta !== 0) {
    lines.push({
      text: `Образование ${c.eduDelta > 0 ? '+' : ''}${c.eduDelta}`,
      tone: c.eduDelta > 0 ? 'good' : 'bad',
    })
  }
  if (c.proDelta != null && c.proDelta !== 0) {
    lines.push({
      text: `Навыки ${c.proDelta > 0 ? '+' : ''}${c.proDelta}`,
      tone: c.proDelta > 0 ? 'good' : 'bad',
    })
  }
  if (c.networkDelta != null && c.networkDelta !== 0) {
    lines.push({
      text: `Сеть ${c.networkDelta > 0 ? '+' : ''}${c.networkDelta}`,
      tone: c.networkDelta > 0 ? 'good' : 'bad',
    })
  }
  if (c.familyDelta != null && c.familyDelta !== 0) {
    lines.push({
      text: `Семья ${c.familyDelta > 0 ? '+' : ''}${c.familyDelta}`,
      tone: 'neutral',
    })
  }
  if (c.fireJob) {
    lines.push({ text: 'Увольнение: оклад → 0', tone: 'bad' })
  }
  if (c.buyCar) {
    lines.push({ text: 'Появляется авто (−время в пути, +расходы)', tone: 'neutral' })
  }
  if (c.addHabit) {
    const h = c.addHabit
    const bits = [h.name]
    if (h.monthlyCost) bits.push(`−${formatMoney(h.monthlyCost)}/мес`)
    if (h.monthlyTime) bits.push(`−${h.monthlyTime} ч/мес`)
    lines.push({ text: `Привычка: ${bits.join(', ')}`, tone: 'bad' })
  }
  if (c.quitHabitId) {
    lines.push({
      text: c.quitHabitId === '*' ? 'Снять привычку' : 'Снять указанную привычку',
      tone: 'good',
    })
  }
  if (c.addAsset) {
    const a = c.addAsset
    const bits = [`Актив «${a.name}»`]
    if (a.monthlyIncome) bits.push(`+${formatMoney(a.monthlyIncome)}/мес`)
    if (a.monthlyTime) bits.push(`−${a.monthlyTime} ч/мес`)
    if (a.cost) bits.push(`стоимость ${formatMoney(a.cost)}`)
    lines.push({ text: bits.join(' · '), tone: 'good' })
  }
  if (c.addLiability) {
    const l = c.addLiability
    lines.push({
      text: `Долг «${l.name}»: ${formatMoney(l.balance)}, платёж ${formatMoney(l.monthlyPayment)}/мес`,
      tone: 'bad',
    })
  }
  if (c.sellAssetType) {
    const pct = Math.round((c.sellPct ?? 1) * 100)
    const names: Record<string, string> = {
      stock: 'акции',
      realty: 'недвижимость',
      business: 'бизнес',
      crypto: 'крипто',
      art: 'арт',
      metal: 'металлы',
      deposit: 'вклады',
      royalty: 'роялти',
      mlm: 'MLM',
    }
    lines.push({
      text: `Продать ${names[c.sellAssetType] ?? c.sellAssetType} (~${pct}% стоимости → кэш)`,
      tone: 'neutral',
    })
  }
  if (c.fulfillDream) {
    lines.push({ text: 'Исполнить мечту (списать стоимость с наличных)', tone: 'good' })
  }

  const reqs = describeRequirements(c)
  for (const r of reqs) lines.push(r)

  if (c.note) {
    lines.push({ text: c.note, tone: 'neutral' })
  }

  if (lines.length === 0) {
    lines.push({ text: 'Без изменений параметров', tone: 'neutral' })
  }

  return lines
}

export function describeRequirements(c: EventChoice): EffectLine[] {
  const reqs: EffectLine[] = []
  if (c.requireCash != null) {
    reqs.push({ text: `Нужно ≥ ${formatMoney(c.requireCash)} наличных`, tone: 'req' })
  }
  if (c.requireNetwork != null) {
    reqs.push({ text: `Нужна сеть ≥ ${c.requireNetwork}`, tone: 'req' })
  }
  if (c.requireEdu != null) {
    reqs.push({ text: `Нужно образование ≥ ${c.requireEdu}`, tone: 'req' })
  }
  if (c.requirePro != null) {
    reqs.push({ text: `Нужны навыки ≥ ${c.requirePro}`, tone: 'req' })
  }
  if (c.requireFreeTime != null) {
    reqs.push({ text: `Нужно ≥ ${c.requireFreeTime} своб. ч`, tone: 'req' })
  }
  return reqs
}

/** Короткая строка эффектов (для компактных чипов) */
export function summarizeChoiceEffects(c: EventChoice): string {
  return describeChoiceEffects(c)
    .filter((l) => l.tone !== 'req')
    .slice(0, 4)
    .map((l) => l.text)
    .join(' · ')
}

export function isDeclineChoice(c: EventChoice, all: EventChoice[]): boolean {
  const soft =
    /отказ|пропуск|не |позже|подождать|остаться|дома|игнор|без |уйти|ещё рано|не готов|не сейчас|не брать|не готов|слишком/i
  if (soft.test(c.label)) return true
  if (all.length >= 2 && all[all.length - 1] === c) {
    const hasImpact =
      (c.cashDelta ?? 0) !== 0 ||
      (c.timeDelta ?? 0) !== 0 ||
      c.addAsset ||
      c.addLiability ||
      c.fulfillDream ||
      c.fireJob ||
      c.buyCar
    if (!hasImpact) return true
  }
  return false
}

export function pickDeclineChoice(choices: EventChoice[]): EventChoice | null {
  const found = [...choices].reverse().find((c) => isDeclineChoice(c, choices))
  return found ?? choices[choices.length - 1] ?? null
}

export function choiceLockReason(p: PlayerState, c: EventChoice): string | null {
  if (choiceAvailable(p, c)) return null
  if (c.requireCash != null && p.cash < c.requireCash) {
    return `Мало денег (есть ${formatMoney(p.cash)})`
  }
  if (c.requireNetwork != null && p.network < c.requireNetwork) {
    return `Сеть ${p.network}/${c.requireNetwork}`
  }
  if (c.requireEdu != null && p.eduLevel < c.requireEdu) {
    return `Образование ${p.eduLevel}/${c.requireEdu}`
  }
  if (c.requirePro != null && p.proSkills < c.requirePro) {
    return `Навыки ${p.proSkills}/${c.requirePro}`
  }
  if (c.requireFreeTime != null) {
    return 'Не хватает свободного времени'
  }
  return 'Условия не выполнены'
}
