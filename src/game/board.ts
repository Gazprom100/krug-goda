import type { BoardCell, CellKind } from './types'

const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

const PATTERN: CellKind[] = [
  'routine',
  'news',
  'opportunity',
  'education',
  'routine',
  'dayoff',
  'event',
]

export function buildBoard(): BoardCell[] {
  const cells: BoardCell[] = []
  let id = 0
  for (let m = 0; m < 12; m++) {
    for (let i = 0; i < 7; i++) {
      const kind = i === 0 ? 'month' : PATTERN[i]
      cells.push({
        id,
        month: m,
        kind,
        label: kind === 'month' ? MONTHS[m] : kindLabel(kind),
      })
      id++
    }
  }
  return cells
}

export function kindLabel(kind: CellKind): string {
  switch (kind) {
    case 'news':
      return 'Новости'
    case 'routine':
      return 'Быт'
    case 'education':
      return 'Учёба'
    case 'opportunity':
      return 'Шанс'
    case 'dayoff':
      return 'Отдых'
    case 'event':
      return 'Событие'
    case 'month':
      return 'Месяц'
  }
}

export function kindColor(kind: CellKind): string {
  switch (kind) {
    case 'news':
      return 'var(--cell-news)'
    case 'routine':
      return 'var(--cell-routine)'
    case 'education':
      return 'var(--cell-edu)'
    case 'opportunity':
      return 'var(--cell-opp)'
    case 'dayoff':
      return 'var(--cell-off)'
    case 'event':
      return 'var(--cell-event)'
    case 'month':
      return 'var(--cell-month)'
  }
}

export const BOARD = buildBoard()
export const BOARD_SIZE = BOARD.length
export const MONTH_NAMES = MONTHS
