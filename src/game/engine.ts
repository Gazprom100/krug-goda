import { BOARD, BOARD_SIZE } from './board'
import { CHARACTERS } from './characters'
import {
  DAYOFF_EVENTS,
  EDUCATION_EVENTS,
  MAJOR_EVENTS,
  NEWS_EVENTS,
  OPPORTUNITY_EVENTS,
  ROUTINE_EVENTS,
  pickFrom,
} from './content/events'
import {
  EXTRA_DAYOFF,
  EXTRA_EDU,
  EXTRA_MAJOR,
  EXTRA_NEWS,
  EXTRA_OPP,
  EXTRA_ROUTINE,
} from './content/extra'
import { BALANCE } from './balance'
import { choiceAvailable } from './choices'
import { summarizeChoiceEffects } from './describeChoice'
import { DREAMS } from './dreams'
import {
  cashFlow,
  formatMoney,
  freeHours,
  sellValue,
  totalExpenses,
  totalIncome,
} from './economy'
import { ageTimeCap, applyMarketToPlayer, createMarket, tickMarket } from './market'
import type {
  EventChoice,
  GameEvent,
  GameState,
  LogEntry,
  PlayerState,
  WorkMode,
} from './types'
import { BASE_TIME, RETIRE_AGE, WIN_CASH, WIN_FREE_HOURS } from './types'

let logSeq = 0
let idSeq = 0
const uid = (p = 'x') => `${p}${++idSeq}${Date.now().toString(36)}`

function log(p: PlayerState, text: string): PlayerState {
  const entry: LogEntry = { id: `l${++logSeq}`, text }
  return { ...p, log: [entry, ...p.log].slice(0, 50) }
}

export function meetsWin(p: PlayerState): boolean {
  return (
    p.dreamBought &&
    cashFlow(p) > 0 &&
    p.cash >= WIN_CASH &&
    freeHours(p) >= WIN_FREE_HOURS
  )
}

export function winProgress(p: PlayerState) {
  return {
    dream: p.dreamBought,
    cashFlowOk: cashFlow(p) > 0,
    cashOk: p.cash >= WIN_CASH,
    timeOk: freeHours(p) >= WIN_FREE_HOURS,
  }
}

function syncTimeCap(p: PlayerState): PlayerState {
  return { ...p, timeCap: ageTimeCap(p.age, BASE_TIME) }
}

export function createSetupState(playerCount = 1): GameState {
  return {
    phase: 'setup',
    setupStep: 'players',
    playerCount: Math.min(4, Math.max(1, playerCount)),
    activeIndex: 0,
    viewIndex: 0,
    players: [],
    year: 1,
    monthIndex: 0,
    monthsPlayed: 0,
    market: createMarket(),
    showTutorial: true,
    difficultyBias: 'normal',
    winnerIds: [],
    lastToast: null,
  }
}

export function createPlayer(
  characterId: string,
  dreamId: string,
  seat = 0,
  isAi = false,
): PlayerState {
  const c = CHARACTERS.find((x) => x.id === characterId) ?? CHARACTERS[0]
  const dream = DREAMS.find((d) => d.id === dreamId) ?? DREAMS[0]
  let p: PlayerState = {
    id: uid('p'),
    characterId: c.id,
    name: isAi ? `${c.name} (ИИ)` : c.name,
    age: c.age,
    position: seat * 3,
    cash: c.cash,
    timeCap: BASE_TIME,
    salary: c.salary,
    jobTitle: c.jobTitle,
    jobHours: c.jobHours,
    careerLevel: c.careerLevel,
    workMode: 'job',
    field: c.field,
    eduField: c.eduField,
    eduLevel: c.eduLevel,
    eduDecayMonths: 0,
    proSkills: c.proSkills,
    network: c.network,
    baseExpenses: c.expenses,
    familySize: c.familySize,
    habits: structuredClone(c.habits),
    hasCar: c.hasCar,
    dreamId: dream.id,
    dreamName: dream.name,
    dreamCost: dream.cost,
    dreamBought: false,
    assets: [],
    liabilities: [],
    pendingEvent: null,
    lastRoll: null,
    bankruptcies: 0,
    fired: false,
    jobOffersLeft: 3,
    alive: true,
    won: false,
    isAi,
    log: [],
  }
  p = syncTimeCap(p)
  p = log(
    p,
    `${p.name} начинает. Мечта: ${p.dreamName}. Победа: мечта + поток>0 + ${formatMoney(WIN_CASH)} + ${WIN_FREE_HOURS} своб.ч до ${RETIRE_AGE} лет.`,
  )
  return p
}

export function startGame(
  characterIds: string[],
  dreamIds: string[],
  aiFlags: boolean[] = [],
  humanDisplayName?: string,
): GameState {
  const players = characterIds.map((cid, i) => {
    const p = createPlayer(cid, dreamIds[i] ?? 'studio', i, Boolean(aiFlags[i]))
    if (!p.isAi && humanDisplayName?.trim()) {
      return { ...p, name: humanDisplayName.trim() }
    }
    return p
  })
  return {
    phase: 'playing',
    setupStep: 'tutorial',
    playerCount: players.length,
    activeIndex: 0,
    viewIndex: 0,
    players,
    year: 1,
    monthIndex: 0,
    monthsPlayed: 0,
    market: createMarket(),
    showTutorial: true,
    difficultyBias: 'normal',
    winnerIds: [],
    lastToast: players.some((p) => p.isAi)
      ? 'В партии есть ИИ — ходы ботов выполняются сами.'
      : 'Удачной партии!',
  }
}

function active(state: GameState): PlayerState {
  return state.players[state.activeIndex]
}

function withActive(state: GameState, p: PlayerState): GameState {
  const players = state.players.slice()
  players[state.activeIndex] = p
  return { ...state, players }
}

function nextAliveIndex(state: GameState, from: number): number {
  const n = state.players.length
  for (let i = 1; i <= n; i++) {
    const idx = (from + i) % n
    if (state.players[idx].alive && !state.players[idx].won) return idx
  }
  return from
}

function endTurn(state: GameState): GameState {
  const idx = nextAliveIndex(state, state.activeIndex)
  return { ...state, activeIndex: idx, viewIndex: idx }
}

function checkFinished(state: GameState): GameState {
  const winners = state.players.filter((p) => p.won).map((p) => p.id)
  const allDone = state.players.every((p) => !p.alive || p.won || p.age >= RETIRE_AGE)
  if (winners.length > 0 && (state.playerCount === 1 || allDone)) {
    return { ...state, phase: 'finished', winnerIds: winners }
  }
  if (allDone) return { ...state, phase: 'finished', winnerIds: winners }
  return state
}

function monthTickPlayer(p: PlayerState, marketMultPassives: boolean): PlayerState {
  let next = { ...p }
  const flow = cashFlow(next)
  next.cash += flow
  next.eduDecayMonths += 1
  if (next.eduDecayMonths >= BALANCE.eduDecayMonths && next.eduLevel > 0) {
    next.eduLevel -= 1
    next.eduDecayMonths = 0
    next = log(next, 'Образование частично устарело (−1).')
  }

  next.liabilities = next.liabilities
    .map((l) => ({ ...l, balance: Math.max(0, l.balance - l.monthlyPayment) }))
    .filter((l) => l.balance > 0)

  // корзина растёт с доходом
  const income = totalIncome(next)
  if (income > next.baseExpenses * 3) {
    next.baseExpenses = Math.max(next.baseExpenses, Math.round(income * 0.18))
  }

  next = log(
    next,
    `Месяц закрыт: поток ${flow >= 0 ? '+' : ''}${formatMoney(flow)}. Расходы ${formatMoney(totalExpenses(next))}.`,
  )

  if (next.cash < 0) {
    next = resolveBankruptcy(next)
  }

  if (marketMultPassives) {
    // noop placeholder
  }

  return next
}

export function resolveBankruptcy(p: PlayerState): PlayerState {
  let next = log(
    { ...p, bankruptcies: p.bankruptcies + 1 },
    'Нехватка денег — банкротство: продаём активы со скидкой.',
  )
  while (next.cash < 0 && next.assets.length > 0) {
    const asset = next.assets[0]
    const value = sellValue(asset, 1)
    next.cash += value
    next.assets = next.assets.slice(1)
    next = log(next, `Продано «${asset.name}» за ${formatMoney(value)}.`)
  }
  if (next.cash < 0 && next.liabilities.length > 0) {
    // реструктуризация
    next.liabilities = next.liabilities.map((l) => ({
      ...l,
      monthlyPayment: Math.max(1000, Math.round(l.monthlyPayment * 0.7)),
    }))
    next.cash = 0
    next = log(next, 'Долги реструктурированы, касса обнулена.')
  }
  if (next.cash < -50000 && next.assets.length === 0) {
    next = { ...next, alive: false }
    next = log(next, 'Полный крах — выбывание из партии.')
  }
  return next
}

function eventForKind(kind: string): GameEvent | null {
  switch (kind) {
    case 'news':
      return pickFrom([...NEWS_EVENTS, ...EXTRA_NEWS])
    case 'routine':
      return pickFrom([...ROUTINE_EVENTS, ...EXTRA_ROUTINE])
    case 'education':
      return pickFrom([...EDUCATION_EVENTS, ...EXTRA_EDU])
    case 'opportunity':
      return pickFrom([...OPPORTUNITY_EVENTS, ...EXTRA_OPP])
    case 'dayoff':
      return pickFrom([...DAYOFF_EVENTS, ...EXTRA_DAYOFF])
    case 'event':
      return pickFrom([...MAJOR_EVENTS, ...EXTRA_MAJOR])
    default:
      return null
  }
}

export { filterChoices, choiceAvailable } from './choices'

function countMonthCrossings(from: number, roll: number): number {
  let count = 0
  for (let s = 1; s <= roll; s++) {
    const idx = (from + s) % BOARD_SIZE
    if (BOARD[idx].kind === 'month') count++
  }
  return count
}

function advanceCalendar(state: GameState, months: number): GameState {
  let next = { ...state }
  for (let i = 0; i < months; i++) {
    next.monthsPlayed += 1
    next.monthIndex = (next.monthIndex + 1) % 12
    if (next.monthIndex === 0) {
      next.year += 1
      next.players = next.players.map((p) => {
        if (!p.alive) return p
        let np = { ...p, age: p.age + 1 }
        np = syncTimeCap(np)
        np = log(np, `День рождения: ${np.age} лет. Лимит времени ${np.timeCap} ч.`)
        if (np.age >= RETIRE_AGE && !np.won) {
          np = { ...np, alive: false }
          np = log(np, 'Пенсия в 65 — партия для героя завершена.')
        }
        return np
      })
    }

    const crisis =
      next.market.crisisCooldown === 0 &&
      Math.random() <
        (next.year >= 4 ? BALANCE.crisisChanceLate : BALANCE.crisisChanceEarly)
    next.market = tickMarket(next.market, crisis)
    next.players = next.players.map((p) => {
      if (!p.alive) return p
      let np = applyMarketToPlayer(p, next.market)
      np = monthTickPlayer(np, true)
      if (crisis) np = log(np, 'На рынке кризис!')
      if (meetsWin(np)) {
        np = { ...np, won: true }
        np = log(np, 'Все 4 условия победы выполнены!')
      }
      return np
    })
  }
  return checkFinished(next)
}

export function rollDice(state: GameState): GameState {
  if (state.phase !== 'playing') return state
  let p = active(state)
  if (!p.alive || p.won || p.pendingEvent) return state

  const roll = 1 + Math.floor(Math.random() * 6)
  const from = p.position
  const to = (from + roll) % BOARD_SIZE
  p = { ...p, position: to, lastRoll: roll }
  p = log(p, `Кубик ${roll} → клетка «${BOARD[to].label}».`)

  let next = withActive(state, p)
  const crossed = countMonthCrossings(from, roll)
  if (crossed > 0) next = advanceCalendar(next, crossed)

  p = active(next)
  if (!p.alive || p.won) return endTurn(checkFinished(next))

  const cell = BOARD[p.position]
  if (cell.kind !== 'month') {
    let ev = eventForKind(cell.kind)
    if (ev?.id === 'm6' && !p.fired) {
      ev = pickFrom(MAJOR_EVENTS.filter((x) => x.id !== 'm6'))
    }
    if (ev?.id === 'm5' && p.fired) {
      ev = pickFrom(MAJOR_EVENTS.filter((x) => x.id !== 'm5'))
    }
    p = { ...p, pendingEvent: ev }
    next = withActive(next, p)
  } else {
    // клетка нового месяца — оффер найма
    if (p.fired || p.workMode === 'none') {
      p = {
        ...p,
        pendingEvent: {
          id: 'job-offer',
          title: 'Вакансия месяца',
          text: 'Можно вернуться в найм.',
          choices: [
            {
              label: `Выйти на работу (+${formatMoney(Math.round(40000 + p.careerLevel * 15000))})`,
              note: 'Найм восстановлен',
            },
            { label: 'Остаться свободным' },
          ],
        },
      }
      next = withActive(next, p)
    } else {
      next = endTurn(next)
    }
  }

  return next
}

export function applyChoice(state: GameState, choice: EventChoice): GameState {
  if (state.phase !== 'playing') return state
  let p = active(state)
  if (!p.pendingEvent) return state

  const eventId = p.pendingEvent.id
  if (!choiceAvailable(p, choice) && choice.label !== 'Недоступно — пропуск') {
    p = log(p, 'Условия выбора не выполнены.')
    return withActive(state, p)
  }

  p = { ...p, pendingEvent: null }
  p = {
    ...p,
    cash: p.cash + (choice.cashDelta ?? 0),
    baseExpenses: Math.max(3500, p.baseExpenses + (choice.expenseDelta ?? 0)),
    salary: Math.max(0, p.salary + (choice.salaryDelta ?? 0)),
    jobHours: Math.max(0, p.jobHours + (choice.jobHoursDelta ?? 0)),
    careerLevel: Math.max(0, p.careerLevel + (choice.careerDelta ?? 0)),
    eduLevel: Math.max(0, p.eduLevel + (choice.eduDelta ?? 0)),
    proSkills: Math.max(0, p.proSkills + (choice.proDelta ?? 0)),
    network: Math.max(0, p.network + (choice.networkDelta ?? 0)),
    familySize: Math.max(0, p.familySize + (choice.familyDelta ?? 0)),
  }

  if (choice.timeDelta) {
    // разовое изменение свободного времени через временный сдвиг jobHours/habits — кладём в «бонус» уменьшением jobHours отрицательно нельзя; используем timeCap clamp через одноразовый asset time 0 и корректировку cash already done
    // Практично: уменьшаем jobHours если timeDelta>0 как эффект эффективности
    if (choice.timeDelta > 0) {
      p.jobHours = Math.max(20, p.jobHours - Math.floor(choice.timeDelta / 3))
    } else {
      // потратили время — если не хватает free hours, штраф деньгами
      const need = -choice.timeDelta
      if (freeHours(p) < need) {
        p.cash -= need * 200
        p = log(p, 'Не хватило часов — штраф за перегруз.')
      } else {
        p.jobHours = Math.min(p.timeCap - 10, p.jobHours + Math.ceil(need / 4))
      }
    }
  }

  if (choice.buyCar) p.hasCar = true

  if (choice.addHabit) {
    p.habits = [...p.habits, { ...choice.addHabit, id: uid('h') }]
  }
  if (choice.quitHabitId) {
    if (choice.quitHabitId === '*') p.habits = p.habits.slice(1)
    else p.habits = p.habits.filter((h) => h.id !== choice.quitHabitId)
  }

  if (choice.addAsset) {
    const a = choice.addAsset
    p.assets = [
      ...p.assets,
      {
        ...a,
        id: uid('a'),
        marketValue: a.marketValue ?? a.cost,
      },
    ]
  }
  if (choice.addLiability) {
    p.liabilities = [...p.liabilities, { ...choice.addLiability, id: uid('d') }]
  }

  if (choice.sellAssetType) {
    const pct = choice.sellPct ?? 1
    const kept: typeof p.assets = []
    for (const asset of p.assets) {
      if (asset.type === choice.sellAssetType) {
        const value = sellValue(asset, pct)
        p.cash += value
        p = log(p, `Продажа «${asset.name}»: +${formatMoney(value)}`)
      } else kept.push(asset)
    }
    p.assets = kept
  }

  if (choice.fireJob) {
    p.fired = true
    p.workMode = 'none'
    p.salary = 0
    p.jobHours = 0
    p.jobTitle = 'Без работы'
  }

  if (eventId === 'job-offer' && choice.label.startsWith('Выйти')) {
    const sal = Math.round(40000 + p.careerLevel * 15000)
    p.fired = false
    p.workMode = 'job'
    p.salary = sal
    p.jobHours = 100
    p.jobTitle = `Специалист (${p.field})`
  }

  if (eventId === 'm6') {
    if (choice.label.startsWith('Вернуться')) {
      p.fired = false
      p.workMode = 'job'
      p.salary = Math.round(45000 + p.careerLevel * 12000)
      p.jobHours = 105
      p.jobTitle = `Снова в найме (${p.field})`
    } else if (choice.label.includes('Отказать')) {
      p.jobOffersLeft = Math.max(0, p.jobOffersLeft - 1)
    }
  }

  if (choice.fulfillDream || (eventId === 'd3' && choice.fulfillDream)) {
    if (p.cash >= p.dreamCost && !p.dreamBought) {
      p.cash -= p.dreamCost
      p.dreamBought = true
      p = log(p, `Мечта «${p.dreamName}» исполнена!`)
    } else {
      p = log(p, 'Мечту пока нельзя: мало денег или уже куплена.')
    }
  }

  if (eventId === 'm10') {
    // кризис уже может тикать — форсируем
    const market = tickMarket(state.market, true)
    p = applyMarketToPlayer(p, market)
    p = log(p, 'Кризис обвалил котировки.')
    state = { ...state, market }
  }

  p = log(p, choice.note ?? choice.label)

  if (meetsWin(p)) {
    p = { ...p, won: true }
    p = log(p, 'Победа по всем 4 условиям!')
  }

  if (p.cash < 0) p = resolveBankruptcy(p)

  const effectSummary = summarizeChoiceEffects(choice)
  let next = withActive(state, p)
  next = setToast(next, `${p.name}: ${choice.label} — ${effectSummary}`)
  next = checkFinished(next)
  if (next.phase === 'playing' && !active(next).pendingEvent) {
    next = endTurn(next)
  }
  return next
}

export function setWorkMode(state: GameState, mode: WorkMode): GameState {
  let p = active(state)
  if (state.phase !== 'playing' || p.pendingEvent || !p.alive) return state

  if (mode === 'freelance' && p.eduLevel < BALANCE.freelanceEduNeed) {
    return withActive(state, log(p, 'Для фриланса нужно образование ≥ 1.'))
  }
  if (
    mode === 'business' &&
    (p.eduLevel < BALANCE.businessEduNeed || p.proSkills < BALANCE.businessProNeed)
  ) {
    return withActive(state, log(p, 'Для фокуса на бизнесе: обр.≥2 и проф.≥1.'))
  }

  if (mode === 'job') {
    if (p.fired && p.jobOffersLeft <= 0) {
      return withActive(state, log(p, 'Офферов больше нет.'))
    }
    p = {
      ...p,
      workMode: 'job',
      fired: false,
      salary: Math.round(40000 + p.careerLevel * 15000 + p.eduLevel * 5000),
      jobHours: 100 + p.careerLevel * 5,
      jobTitle: `${p.field} · уровень ${p.careerLevel}`,
    }
  } else if (mode === 'freelance') {
    p = {
      ...p,
      workMode: 'freelance',
      fired: false,
      salary: 30000 + p.eduLevel * 14000 + p.proSkills * 8000,
      jobHours: 60,
      jobTitle: 'Фриланс',
    }
  } else if (mode === 'business') {
    p = {
      ...p,
      workMode: 'business',
      fired: false,
      salary: 15000 + p.proSkills * 10000,
      jobHours: 35,
      jobTitle: 'Фокус на своём деле',
    }
  } else {
    p = {
      ...p,
      workMode: 'none',
      salary: 0,
      jobHours: 0,
      jobTitle: 'Без работы',
      fired: true,
    }
  }

  p = log(p, `Режим работы: ${p.jobTitle}`)
  return withActive(state, p)
}

export function buyDreamManual(state: GameState): GameState {
  let p = active(state)
  if (p.pendingEvent || !p.alive) return state
  if (p.dreamBought) return withActive(state, log(p, 'Мечта уже есть.'))
  if (p.cash < p.dreamCost) return withActive(state, log(p, 'Не хватает на мечту.'))
  p = { ...p, cash: p.cash - p.dreamCost, dreamBought: true }
  p = log(p, `Мечта «${p.dreamName}» куплена.`)
  if (meetsWin(p)) {
    p = { ...p, won: true }
    p = log(p, 'Победа!')
  }
  return checkFinished(withActive(state, p))
}

export function dismissTutorial(state: GameState): GameState {
  return { ...state, showTutorial: false }
}

export function clearToast(state: GameState): GameState {
  return { ...state, lastToast: null }
}

export function setToast(state: GameState, text: string): GameState {
  return { ...state, lastToast: text }
}

export { formatMoney, freeHours, cashFlow, totalIncome, totalExpenses }
export {
  passiveIncome,
  hourlyRate,
  netWorth,
  timeUsed,
} from './economy'
