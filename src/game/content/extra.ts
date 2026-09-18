import type { GameEvent } from '../types'

function e(
  id: string,
  title: string,
  text: string,
  choices: GameEvent['choices'],
  weight = 1,
): GameEvent {
  return { id, title, text, choices, weight }
}

export const EXTRA_NEWS: GameEvent[] = [
  e('nx1', 'Субсидия на жильё', 'Государство частично помогает.', [
    { label: 'Оформить (−10 ч, +60 000)', timeDelta: -10, cashDelta: 60000 },
    { label: 'Не связываться' },
  ]),
  e('nx2', 'IPO знакомой компании', 'Можно войти на старте.', [
    {
      label: 'Пакет на 150 000',
      cashDelta: -150000,
      requireCash: 150000,
      addAsset: {
        name: 'IPO-пакет',
        type: 'stock',
        cost: 150000,
        monthlyIncome: 3500,
        monthlyTime: 1,
        quality: 2,
      },
    },
    { label: 'Пропуск' },
  ]),
  e('nx3', 'Дефляция коротко', 'Цены чуть просели.', [
    { label: 'Выгодно', expenseDelta: -1500, note: 'Расходы −1500' },
  ]),
]

export const EXTRA_ROUTINE: GameEvent[] = [
  e('rx1', 'Ремонт подъезда', 'Сбор с жильцов.', [
    { label: 'Скинуться (−8 000)', cashDelta: -8000 },
    { label: 'Тянуть', expenseDelta: 500 },
  ]),
  e('rx2', 'Онлайн-школа ребёнку', 'Если есть семья.', [
    { label: 'Оплатить (−12 000)', cashDelta: -12000, networkDelta: 1 },
    { label: 'Бесплатные курсы (−6 ч)', timeDelta: -6 },
  ]),
  e('rx3', 'Кэшбэк-месяц', 'Карта вернула часть трат.', [
    { label: 'Забрать +6 000', cashDelta: 6000 },
  ]),
]

export const EXTRA_EDU: GameEvent[] = [
  e('ex1', 'Подкаст-марафон', 'Дешёвая прокачка.', [
    { label: 'Слушать (−6 ч)', timeDelta: -6, eduDelta: 1 },
    { label: 'Пропуск' },
  ]),
  e('ex2', 'Стажировка у профи', 'Практика важнее диплома.', [
    {
      label: 'Пройти (−10 000, −20 ч)',
      cashDelta: -10000,
      timeDelta: -20,
      proDelta: 2,
      networkDelta: 1,
    },
    { label: 'Нет' },
  ]),
]

export const EXTRA_OPP: GameEvent[] = [
  e('ox1', 'Паркинг на сдачу', 'Малый объект.', [
    {
      label: 'Купить 220 000',
      cashDelta: -220000,
      requireCash: 220000,
      addAsset: {
        name: 'Машиноместо',
        type: 'realty',
        cost: 220000,
        monthlyIncome: 11000,
        monthlyTime: 2,
        quality: 1,
      },
    },
    { label: 'Отказ' },
  ]),
  e('ox2', 'YouTube-канал', 'Долгий роялти.', [
    {
      label: 'Запустить (−35 ч, обр.≥1)',
      timeDelta: -35,
      requireEdu: 1,
      requireFreeTime: 30,
      addAsset: {
        name: 'Канал',
        type: 'royalty',
        cost: 0,
        monthlyIncome: 7000,
        monthlyTime: 12,
        quality: 1,
      },
    },
    { label: 'Позже' },
  ]),
  e('ox3', 'Доля в кофейне', 'Средний чек.', [
    {
      label: 'Войти (−180 000, сеть≥2)',
      cashDelta: -180000,
      requireCash: 180000,
      requireNetwork: 2,
      addAsset: {
        name: 'Доля в кофейне',
        type: 'business',
        cost: 180000,
        monthlyIncome: 16000,
        monthlyTime: 10,
        quality: 2,
      },
    },
    { label: 'Нет' },
  ]),
]

export const EXTRA_DAYOFF: GameEvent[] = [
  e('dx1', 'Цифровой детокс', 'Возврат внимания.', [
    { label: 'Детокс (+12 ч, бросить соцсети если есть)', timeDelta: 12, quitHabitId: '*' },
  ]),
  e('dx2', 'Мастермайнд', 'Круг сильных людей.', [
    {
      label: 'Участие (−7 000, −8 ч)',
      cashDelta: -7000,
      timeDelta: -8,
      networkDelta: 2,
      eduDelta: 1,
    },
    { label: 'Дома' },
  ]),
]

export const EXTRA_MAJOR: GameEvent[] = [
  e('mx1', 'Премия на работе', 'Квартальный бонус.', [
    { label: 'Получить +80 000', cashDelta: 80000 },
  ]),
  e('mx2', 'Перевод в другой город', 'Оффер с плюсом.', [
    {
      label: 'Переехать (+25 000 оклад, −время)',
      salaryDelta: 25000,
      timeDelta: -10,
      expenseDelta: 4000,
      careerDelta: 1,
    },
    { label: 'Остаться' },
  ]),
  e('mx3', 'Стартап друга просит seed', 'Риск.', [
    {
      label: 'Вложить 100 000',
      cashDelta: -100000,
      requireCash: 100000,
      addAsset: {
        name: 'Seed-доля',
        type: 'business',
        cost: 100000,
        monthlyIncome: 0,
        monthlyTime: 3,
        quality: 1,
      },
    },
    { label: 'Отказать' },
  ]),
]
