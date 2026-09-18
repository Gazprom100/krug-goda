import { BALANCE } from './balance'

export type CellKind =
  | 'news'
  | 'routine'
  | 'education'
  | 'opportunity'
  | 'dayoff'
  | 'event'
  | 'month'

export type WorkMode = 'job' | 'freelance' | 'business' | 'none'
export type EduField = 'tech' | 'humanities' | 'econ' | 'none'
export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert'
export type AssetType =
  | 'realty'
  | 'stock'
  | 'business'
  | 'deposit'
  | 'royalty'
  | 'mlm'
  | 'art'
  | 'crypto'
  | 'metal'

export interface BoardCell {
  id: number
  month: number
  kind: CellKind
  label: string
}

export interface Habit {
  id: string
  name: string
  monthlyCost: number
  monthlyTime: number
}

export interface Character {
  id: string
  name: string
  age: number
  blurb: string
  difficulty: Difficulty
  cash: number
  timePerMonth: number
  jobTitle: string
  careerLevel: number
  salary: number
  jobHours: number
  field: string
  eduField: EduField
  eduLevel: number
  proSkills: number
  network: number
  expenses: number
  familySize: number
  habits: Habit[]
  hasCar: boolean
  dreamOptions: string[]
}

export interface DreamDef {
  id: string
  name: string
  cost: number
  blurb: string
}

export interface Asset {
  id: string
  name: string
  type: AssetType
  cost: number
  marketValue: number
  monthlyIncome: number
  monthlyTime: number
  quality: number
}

export interface Liability {
  id: string
  name: string
  balance: number
  monthlyPayment: number
}

export interface MarketState {
  stocks: number
  realty: number
  crypto: number
  art: number
  metals: number
  crisisCooldown: number
}

export interface EventChoice {
  label: string
  cashDelta?: number
  timeDelta?: number
  expenseDelta?: number
  salaryDelta?: number
  jobHoursDelta?: number
  careerDelta?: number
  eduDelta?: number
  proDelta?: number
  networkDelta?: number
  fireJob?: boolean
  quitHabitId?: string
  addHabit?: Habit
  addAsset?: Omit<Asset, 'id' | 'marketValue'> & { marketValue?: number }
  addLiability?: Omit<Liability, 'id'>
  familyDelta?: number
  buyCar?: boolean
  sellAssetType?: AssetType
  sellPct?: number
  fulfillDream?: boolean
  note?: string
  requireNetwork?: number
  requireEdu?: number
  requirePro?: number
  requireCash?: number
  requireFreeTime?: number
}

export interface GameEvent {
  id: string
  title: string
  text: string
  choices: EventChoice[]
  weight?: number
}

export interface LogEntry {
  id: string
  text: string
}

export interface PlayerState {
  id: string
  characterId: string
  name: string
  age: number
  position: number
  cash: number
  timeCap: number
  salary: number
  jobTitle: string
  jobHours: number
  careerLevel: number
  workMode: WorkMode
  field: string
  eduField: EduField
  eduLevel: number
  eduDecayMonths: number
  proSkills: number
  network: number
  baseExpenses: number
  familySize: number
  habits: Habit[]
  hasCar: boolean
  dreamId: string
  dreamName: string
  dreamCost: number
  dreamBought: boolean
  assets: Asset[]
  liabilities: Liability[]
  pendingEvent: GameEvent | null
  lastRoll: number | null
  bankruptcies: number
  fired: boolean
  jobOffersLeft: number
  alive: boolean
  won: boolean
  isAi: boolean
  log: LogEntry[]
}

export interface GameState {
  phase: 'setup' | 'playing' | 'finished'
  setupStep: 'players' | 'dreams' | 'tutorial'
  playerCount: number
  activeIndex: number
  viewIndex: number
  players: PlayerState[]
  year: number
  monthIndex: number
  monthsPlayed: number
  market: MarketState
  showTutorial: boolean
  difficultyBias: Difficulty
  winnerIds: string[]
  lastToast: string | null
}

export const WIN_CASH = BALANCE.winCash
export const WIN_FREE_HOURS = BALANCE.winFreeHours
export const RETIRE_AGE = BALANCE.retireAge
export const BASE_TIME = BALANCE.baseTime
