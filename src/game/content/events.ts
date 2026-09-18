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

export const NEWS_EVENTS: GameEvent[] = [
  e('n1', 'Инфляция', 'Цены растут быстрее зарплат.', [
    { label: 'Принять', expenseDelta: 3000, note: 'Расходы +3000' },
    { label: 'Урезать досуг', expenseDelta: 1000, timeDelta: -10 },
  ]),
  e('n2', 'Рынок акций растёт', 'Индексы в плюсе.', [
    {
      label: 'Купить ETF на 80 000',
      cashDelta: -80000,
      requireCash: 80000,
      addAsset: {
        name: 'ETF «Горизонт»',
        type: 'stock',
        cost: 80000,
        monthlyIncome: 2400,
        monthlyTime: 1,
        quality: 1,
      },
    },
    { label: 'Пропуск' },
  ]),
  e('n3', 'Ставки по вкладам', 'Банки меняют доходность.', [
    {
      label: 'Вклад 100 000',
      cashDelta: -100000,
      requireCash: 100000,
      addAsset: {
        name: 'Вклад',
        type: 'deposit',
        cost: 100000,
        monthlyIncome: 700,
        monthlyTime: 0,
        quality: 1,
      },
    },
    { label: 'Держать кэш' },
  ]),
  e('n4', 'Крипто-ралли', 'Волатильность зашкаливает.', [
    {
      label: 'Купить на 50 000',
      cashDelta: -50000,
      requireCash: 50000,
      addAsset: {
        name: 'Крипто-корзина',
        type: 'crypto',
        cost: 50000,
        monthlyIncome: 0,
        monthlyTime: 2,
        quality: 1,
      },
    },
    { label: 'Слишком рискованно' },
  ]),
  e('n5', 'Пирамида «Быстрый %»', 'Обещают 20% в месяц.', [
    {
      label: 'Вложить 60 000',
      cashDelta: -60000,
      requireCash: 60000,
      note: 'С большой вероятностью потеря',
      addAsset: {
        name: 'Сомнительный фонд',
        type: 'stock',
        cost: 60000,
        monthlyIncome: 8000,
        monthlyTime: 1,
        quality: 0,
      },
    },
    { label: 'Обойти стороной', networkDelta: 1, note: 'Здравый смысл +сеть' },
  ]),
  e('n6', 'Обвал бумаг', 'Рынок просел.', [
    { label: 'Переждать', note: 'Стоимость акций пересчитается' },
    {
      label: 'Докупить на 40 000',
      cashDelta: -40000,
      requireCash: 40000,
      addAsset: {
        name: 'Акции на просадке',
        type: 'stock',
        cost: 40000,
        monthlyIncome: 1800,
        monthlyTime: 1,
        quality: 1,
      },
    },
  ]),
  e('n7', 'Золото дорожает', 'Металлы в тренде.', [
    {
      label: 'Купить слиток на 120 000',
      cashDelta: -120000,
      requireCash: 120000,
      addAsset: {
        name: 'Золото',
        type: 'metal',
        cost: 120000,
        monthlyIncome: 0,
        monthlyTime: 0,
        quality: 1,
      },
    },
    { label: 'Пропуск' },
  ]),
  e('n8', 'Налоговые льготы', 'Можно оптимизировать.', [
    { label: 'Консультант (−12 000)', cashDelta: -12000, expenseDelta: -2000 },
    { label: 'Игнорировать' },
  ]),
  e('n9', 'Курс валют скачет', 'Импорт дорожает.', [
    { label: 'Принять', expenseDelta: 2000 },
    { label: 'Запас продуктов (−15 000)', cashDelta: -15000, expenseDelta: -500 },
  ]),
  e('n10', 'Ипотечные ставки вниз', 'Окно для недвижимости.', [
    {
      label: 'Ипотека комнаты (взнос 150 000)',
      cashDelta: -150000,
      requireCash: 150000,
      requireNetwork: 2,
      addAsset: {
        name: 'Комната в аренду',
        type: 'realty',
        cost: 150000,
        monthlyIncome: 20000,
        monthlyTime: 5,
        quality: 1,
      },
      addLiability: {
        name: 'Ипотека комнаты',
        balance: 1100000,
        monthlyPayment: 16000,
      },
    },
    { label: 'Подождать' },
  ]),
  e('n11', 'Скандал вокруг стартапа', 'Рынок нервничает.', [
    { label: 'Выйти в кэш (продать акции ~100%)', sellAssetType: 'stock', sellPct: 1 },
    { label: 'Держать' },
  ]),
  e('n12', 'Господдержка малого дела', 'Грант для бизнеса.', [
    {
      label: 'Подать заявку (−8 ч, сеть≥2)',
      timeDelta: -8,
      requireNetwork: 2,
      cashDelta: 80000,
      note: 'Грант получен',
    },
    { label: 'Не тратить время' },
  ]),
  e('n13', 'Рост арендных ставок', 'Лендлорды в плюсе.', [
    { label: 'Отлично для аренды', note: 'Доход с недвижимости вырастет в тике рынка' },
  ]),
  e('n14', 'Кибер-атака на банки', 'Переводы тормозят.', [
    { label: 'Держать наличные (−время)', timeDelta: -6 },
  ]),
  e('n15', 'Бум блогинга', 'Контент снова в цене.', [
    {
      label: 'Запустить блог (−25 ч)',
      timeDelta: -25,
      requireFreeTime: 25,
      addAsset: {
        name: 'Блог',
        type: 'royalty',
        cost: 0,
        monthlyIncome: 5000,
        monthlyTime: 10,
        quality: 1,
      },
    },
    { label: 'Не сейчас' },
  ]),
]

export const ROUTINE_EVENTS: GameEvent[] = [
  e('r1', 'Коммуналка', 'Счета за месяц.', [
    { label: 'Оплатить 10 000', cashDelta: -10000 },
    { label: 'Эконом (−5 000, −8 ч)', cashDelta: -5000, timeDelta: -8 },
  ]),
  e('r2', 'Ремонт техники', 'Сломался ноутбук.', [
    { label: 'Ремонт 9 000', cashDelta: -9000 },
    { label: 'Новый 45 000', cashDelta: -45000 },
  ]),
  e('r3', 'День рождения', 'Друзья зовут.', [
    { label: 'Пойти (−7 000, −6 ч)', cashDelta: -7000, timeDelta: -6, networkDelta: 1 },
    { label: 'Остаться дома' },
  ]),
  e('r4', 'Продуктовая корзина', 'Цены кусаются.', [
    { label: 'Обычный набор (−12 000)', cashDelta: -12000 },
    { label: 'Опт на месяц (−20 000)', cashDelta: -20000, expenseDelta: -800 },
  ]),
  e('r5', 'Подписка на сервисы', 'Снова списали.', [
    { label: 'Оставить (−2 500)', cashDelta: -2500, expenseDelta: 500 },
    { label: 'Отменить всё', expenseDelta: -1500, timeDelta: -2 },
  ]),
  e('r6', 'Здоровье зубов', 'Стоматолог.', [
    { label: 'Лечить (−18 000)', cashDelta: -18000 },
    { label: 'Отложить', expenseDelta: 1000, note: 'Потом дороже' },
  ]),
  e('r7', 'Одежда по сезону', 'Нужен гардероб.', [
    { label: 'Купить (−15 000)', cashDelta: -15000 },
    { label: 'Секонд (−4 000)', cashDelta: -4000 },
  ]),
  e('r8', 'Домашние дела', 'Уборка и быт.', [
    { label: 'Сам (−12 ч)', timeDelta: -12 },
    { label: 'Клининг (−6 000)', cashDelta: -6000 },
  ]),
  e('r9', 'Подарок семье', 'Важная дата.', [
    { label: 'Щедро (−12 000)', cashDelta: -12000, familyDelta: 0, networkDelta: 1 },
    { label: 'Скромно (−3 000)', cashDelta: -3000 },
  ]),
  e('r10', 'Штраф/опоздание', 'Мелочь, а неприятно.', [
    { label: 'Заплатить 3 500', cashDelta: -3500 },
  ]),
  e('r11', 'Ветеринар / питомец', 'Хвостатый член семьи.', [
    { label: 'Лечить (−8 000)', cashDelta: -8000, expenseDelta: 1500 },
    { label: 'Нет питомца — пропуск' },
  ]),
  e('r12', 'Транспорт', 'Проездной или такси.', [
    { label: 'Проездной (−3 000)', cashDelta: -3000 },
    { label: 'Такси постоянно', expenseDelta: 4000 },
  ]),
  e('r13', 'Импульсная покупка', 'Витрина победила.', [
    { label: 'Купить (−20 000)', cashDelta: -20000, note: 'Это пассивный расход' },
    { label: 'Уйти' },
  ]),
  e('r14', 'Соседи затопили', 'Нужен ремонт.', [
    { label: 'Чинить (−25 000)', cashDelta: -25000 },
    {
      label: 'Страховка покрыла (−время)',
      timeDelta: -10,
      note: 'Почти без потерь',
    },
  ]),
  e('r15', 'Семейный ужин', 'Связи важны.', [
    { label: 'Готовить (−8 ч)', timeDelta: -8, networkDelta: 1 },
    { label: 'Ресторан (−9 000)', cashDelta: -9000, networkDelta: 1 },
  ]),
]

export const EDUCATION_EVENTS: GameEvent[] = [
  e('e1', 'Онлайн-курс', 'Навык открывает двери.', [
    {
      label: 'Пройти (−20 000, −24 ч)',
      cashDelta: -20000,
      timeDelta: -24,
      eduDelta: 1,
      proDelta: 1,
    },
    { label: 'Позже' },
  ]),
  e('e2', 'Книга по финансам', 'Дешёвый буст.', [
    { label: 'Прочитать (−1 000, −10 ч)', cashDelta: -1000, timeDelta: -10, eduDelta: 1 },
    { label: 'Пропуск' },
  ]),
  e('e3', 'Ментор', 'Дорого и быстро.', [
    {
      label: 'Месяц с ментором (−40 000, −14 ч)',
      cashDelta: -40000,
      timeDelta: -14,
      eduDelta: 2,
      proDelta: 1,
      networkDelta: 1,
    },
    { label: 'Отказ' },
  ]),
  e('e4', 'Семинар по продажам', 'Для сети и MLM.', [
    {
      label: 'Пойти (−8 000, −12 ч)',
      cashDelta: -8000,
      timeDelta: -12,
      proDelta: 1,
      networkDelta: 1,
    },
    { label: 'Нет' },
  ]),
  e('e5', 'Языковой курс', 'Гуманитарный трек.', [
    { label: 'Курс (−15 000, −20 ч)', cashDelta: -15000, timeDelta: -20, eduDelta: 1 },
    { label: 'Пропуск' },
  ]),
  e('e6', 'Бухучёт для бизнеса', 'Экономика в деле.', [
    {
      label: 'Освоить (−18 000, −22 ч)',
      cashDelta: -18000,
      timeDelta: -22,
      eduDelta: 1,
      proDelta: 1,
    },
    { label: 'Позже' },
  ]),
  e('e7', 'Тайм-менеджмент', 'Часы возвращаются.', [
    {
      label: 'Тренинг (−10 000, −8 ч)',
      cashDelta: -10000,
      timeDelta: 15,
      note: 'Техника экономит время (+15 ч разово, привычка формирует запас)',
    },
    { label: 'Пропуск' },
  ]),
  e('e8', 'Конференция отрасли', 'Нетворкинг + знания.', [
    {
      label: 'Участие (−25 000, −16 ч)',
      cashDelta: -25000,
      timeDelta: -16,
      networkDelta: 2,
      eduDelta: 1,
    },
    { label: 'Онлайн-запись (−5 000, −6 ч)', cashDelta: -5000, timeDelta: -6, eduDelta: 1 },
  ]),
  e('e9', 'Диплом устаревает', 'Нужно обновление.', [
    { label: 'Рефреш (−12 000, −15 ч)', cashDelta: -12000, timeDelta: -15, eduDelta: 1 },
    { label: 'Игнорировать', eduDelta: -1, note: 'Актуальность падает' },
  ]),
  e('e10', 'MBA-модуль', 'Тяжеловесный буст.', [
    {
      label: 'Модуль (−90 000, −40 ч)',
      cashDelta: -90000,
      timeDelta: -40,
      requireCash: 90000,
      eduDelta: 2,
      proDelta: 2,
      networkDelta: 1,
    },
    { label: 'Не сейчас' },
  ]),
  e('e11', 'Курс по недвижимости', 'Для сделок.', [
    {
      label: 'Пройти (−14 000, −18 ч)',
      cashDelta: -14000,
      timeDelta: -18,
      proDelta: 1,
      networkDelta: 1,
    },
    { label: 'Пропуск' },
  ]),
  e('e12', 'Инвест-клуб', 'Разборы портфеля.', [
    {
      label: 'Вступить (−6 000, −8 ч)',
      cashDelta: -6000,
      timeDelta: -8,
      eduDelta: 1,
      networkDelta: 1,
    },
    { label: 'Нет' },
  ]),
]

export const OPPORTUNITY_EVENTS: GameEvent[] = [
  e('o1', 'Гараж под сдачу', 'Небольшой объект.', [
    {
      label: 'Купить 300 000',
      cashDelta: -300000,
      requireCash: 300000,
      requireNetwork: 1,
      addAsset: {
        name: 'Гараж',
        type: 'realty',
        cost: 300000,
        monthlyIncome: 14000,
        monthlyTime: 3,
        quality: 1,
      },
    },
    { label: 'Отказ' },
  ]),
  e('o2', 'Подряд на фриланс', 'Разовая работа.', [
    {
      label: 'Взять (+35 000, −30 ч)',
      cashDelta: 35000,
      timeDelta: -30,
      requireFreeTime: 20,
    },
    { label: 'Не брать' },
  ]),
  e('o3', 'Мини-франшиза', 'Готовый бренд.', [
    {
      label: 'Открыть (−400 000)',
      cashDelta: -400000,
      requireCash: 400000,
      requireEdu: 1,
      requirePro: 1,
      addAsset: {
        name: 'Франшиза «Кофе+»',
        type: 'business',
        cost: 400000,
        monthlyIncome: 32000,
        monthlyTime: 40,
        quality: 1,
      },
    },
    { label: 'Позже' },
  ]),
  e('o4', 'Средний бизнес', 'Только без полной занятости.', [
    {
      label: 'Купить (−900 000)',
      cashDelta: -900000,
      requireCash: 900000,
      requireEdu: 2,
      requirePro: 2,
      requireFreeTime: 50,
      addAsset: {
        name: 'Сервис «БыстроFix»',
        type: 'business',
        cost: 900000,
        monthlyIncome: 70000,
        monthlyTime: 55,
        quality: 2,
      },
    },
    { label: 'Слишком рано' },
  ]),
  e('o5', 'Крупный бизнес', 'Нужны связи и навык.', [
    {
      label: 'Сделка (−2 200 000)',
      cashDelta: -2200000,
      requireCash: 2200000,
      requireNetwork: 4,
      requirePro: 3,
      addAsset: {
        name: 'Сеть точек',
        type: 'business',
        cost: 2200000,
        monthlyIncome: 180000,
        monthlyTime: 35,
        quality: 3,
      },
    },
    { label: 'Не готов' },
  ]),
  e('o6', 'Квартира-студия', 'Аренда + рост цены.', [
    {
      label: 'Купить (−1 600 000)',
      cashDelta: -1600000,
      requireCash: 1600000,
      requireNetwork: 2,
      addAsset: {
        name: 'Студия в аренду',
        type: 'realty',
        cost: 1600000,
        monthlyIncome: 45000,
        monthlyTime: 6,
        quality: 2,
      },
    },
    {
      label: 'Ипотека (взнос 320 000)',
      cashDelta: -320000,
      requireCash: 320000,
      addAsset: {
        name: 'Студия (ипотека)',
        type: 'realty',
        cost: 320000,
        monthlyIncome: 45000,
        monthlyTime: 6,
        quality: 2,
      },
      addLiability: {
        name: 'Ипотека студии',
        balance: 1400000,
        monthlyPayment: 28000,
      },
    },
    { label: 'Пропуск' },
  ]),
  e('o7', 'Пакет акций', 'Дивидендный набор.', [
    {
      label: 'Купить на 200 000',
      cashDelta: -200000,
      requireCash: 200000,
      addAsset: {
        name: 'Дивидендный пакет',
        type: 'stock',
        cost: 200000,
        monthlyIncome: 5000,
        monthlyTime: 1,
        quality: 1,
      },
    },
    { label: 'Нет' },
  ]),
  e('o8', 'Книга / курс автора', 'Роялти.', [
    {
      label: 'Создать (−40 ч, обр.≥2)',
      timeDelta: -40,
      requireEdu: 2,
      requireFreeTime: 40,
      addAsset: {
        name: 'Авторский курс',
        type: 'royalty',
        cost: 0,
        monthlyIncome: 15000,
        monthlyTime: 4,
        quality: 2,
      },
    },
    { label: 'Не сейчас' },
  ]),
  e('o9', 'MLM-сеть', 'Строй структуру.', [
    {
      label: 'Стартовый набор (−25 000, −20 ч)',
      cashDelta: -25000,
      timeDelta: -20,
      requirePro: 1,
      addAsset: {
        name: 'MLM-ветка',
        type: 'mlm',
        cost: 25000,
        monthlyIncome: 8000,
        monthlyTime: 25,
        quality: 1,
      },
    },
    { label: 'Отказ' },
  ]),
  e('o10', 'Картина молодого автора', 'Искусство как актив.', [
    {
      label: 'Купить (−180 000)',
      cashDelta: -180000,
      requireCash: 180000,
      requireEdu: 1,
      addAsset: {
        name: 'Картина',
        type: 'art',
        cost: 180000,
        monthlyIncome: 0,
        monthlyTime: 1,
        quality: 1,
      },
    },
    { label: 'Пропуск' },
  ]),
  e('o11', 'Коммерческое помещение', 'Выше чек.', [
    {
      label: 'Купить (−3 500 000)',
      cashDelta: -3500000,
      requireCash: 3500000,
      requireNetwork: 3,
      addAsset: {
        name: 'Коммерция',
        type: 'realty',
        cost: 3500000,
        monthlyIncome: 120000,
        monthlyTime: 8,
        quality: 3,
      },
    },
    { label: 'Нет капитала' },
  ]),
  e('o12', 'Партнёрство', 'Доля в деле.', [
    {
      label: 'Войти (−250 000, сеть≥3)',
      cashDelta: -250000,
      requireCash: 250000,
      requireNetwork: 3,
      addAsset: {
        name: 'Доля в партнёрстве',
        type: 'business',
        cost: 250000,
        monthlyIncome: 22000,
        monthlyTime: 12,
        quality: 2,
      },
    },
    { label: 'Отказ' },
  ]),
  e('o13', 'Ремонт объекта', 'Поднять качество аренды.', [
    {
      label: 'Вложить 80 000 в ремонт',
      cashDelta: -80000,
      requireCash: 80000,
      note: 'Доход недвижимости будет усилен',
      addAsset: {
        name: 'Улучшение объекта',
        type: 'realty',
        cost: 80000,
        monthlyIncome: 8000,
        monthlyTime: 2,
        quality: 1,
      },
    },
    { label: 'Не ремонтировать' },
  ]),
  e('o14', 'Продажа бизнеса инвестору', 'Кэш-аут.', [
    { label: 'Продать бизнес (~50%)', sellAssetType: 'business', sellPct: 0.5 },
    { label: 'Оставить себе' },
  ]),
  e('o15', 'Антиквариат', 'Риск и вкус.', [
    {
      label: 'Лот (−95 000)',
      cashDelta: -95000,
      requireCash: 95000,
      addAsset: {
        name: 'Антиквариат',
        type: 'art',
        cost: 95000,
        monthlyIncome: 0,
        monthlyTime: 1,
        quality: 1,
      },
    },
    { label: 'Пропуск' },
  ]),
  e('o16', 'Крипто-фонд друзей', 'Высокий риск.', [
    {
      label: 'Вложить 70 000',
      cashDelta: -70000,
      requireCash: 70000,
      addAsset: {
        name: 'Крипто-фонд',
        type: 'crypto',
        cost: 70000,
        monthlyIncome: 0,
        monthlyTime: 2,
        quality: 1,
      },
    },
    { label: 'Нет' },
  ]),
  e('o17', 'Авто как актив времени', 'Машина экономит часы.', [
    {
      label: 'Купить авто (−450 000)',
      cashDelta: -450000,
      requireCash: 450000,
      buyCar: true,
      expenseDelta: 8000,
      note: 'Авто есть: −часы на дорогу, +обслуживание',
    },
    { label: 'Без машины' },
  ]),
  e('o18', 'Помощник / ассистент', 'Покупаешь время.', [
    {
      label: 'Нанять (−25 000/мес эквивалент)',
      expenseDelta: 25000,
      timeDelta: 30,
      note: 'Разово +30 ч запаса; расход вырос',
    },
    { label: 'Сам справлюсь' },
  ]),
]

export const DAYOFF_EVENTS: GameEvent[] = [
  e('d1', 'Выходной', 'Восстановление или подработка.', [
    { label: 'Отдых (+15 ч)', timeDelta: 15 },
    { label: 'Подработка (+12 000, −12 ч)', cashDelta: 12000, timeDelta: -12 },
  ]),
  e('d2', 'Спорт', 'Здоровье снижает расходы.', [
    {
      label: 'Абонемент (−5 000, −10 ч)',
      cashDelta: -5000,
      timeDelta: -10,
      expenseDelta: -800,
    },
    { label: 'Диван' },
  ]),
  e('d3', 'Исполнить мечту', 'Мечту можно закрыть в выходной.', [
    {
      label: 'Купить мечту сейчас',
      fulfillDream: true,
      note: 'Если хватает денег — мечта исполнена',
    },
    { label: 'Ещё рано' },
  ]),
  e('d4', 'Семейный день', 'Время с близкими.', [
    { label: 'Провести (−10 ч)', timeDelta: -10, networkDelta: 1 },
    { label: 'Работать поверх', cashDelta: 8000, timeDelta: -12 },
  ]),
  e('d5', 'Бросить привычку', 'Освободить часы и деньги.', [
    { label: 'Бросить первую вредную привычку', quitHabitId: '*', note: 'Привычка снята' },
    { label: 'Не сейчас' },
  ]),
  e('d6', 'Медитация / тишина', 'Ментальный запас.', [
    { label: 'Практика (+8 ч запаса)', timeDelta: 8 },
  ]),
  e('d7', 'Путешествие выходного', 'Короткий выезд.', [
    { label: 'Съездить (−20 000, −16 ч)', cashDelta: -20000, timeDelta: -16, networkDelta: 1 },
    { label: 'Дома' },
  ]),
  e('d8', 'Волонтёрство', 'Смысл и связи.', [
    { label: 'Помочь (−12 ч)', timeDelta: -12, networkDelta: 2 },
  ]),
  e('d9', 'Гараж-сейл своих вещей', 'Расхламление.', [
    { label: 'Продать хлам (+15 000)', cashDelta: 15000 },
  ]),
  e('d10', 'Хобби в доход', 'Микро-роялти.', [
    {
      label: 'Оформить (−18 ч)',
      timeDelta: -18,
      addAsset: {
        name: 'Хобби-витрина',
        type: 'royalty',
        cost: 0,
        monthlyIncome: 4000,
        monthlyTime: 6,
        quality: 1,
      },
    },
    { label: 'Пропуск' },
  ]),
]

export const MAJOR_EVENTS: GameEvent[] = [
  e('m1', 'Налоговая', 'Нужно закрыть вопрос.', [
    { label: 'Заплатить 22 000', cashDelta: -22000 },
    {
      label: 'Рассрочка',
      addLiability: {
        name: 'Налоговая рассрочка',
        balance: 22000,
        monthlyPayment: 4000,
      },
    },
  ]),
  e('m2', 'Повышение', 'Больше денег и часов.', [
    {
      label: 'Согласиться',
      salaryDelta: 18000,
      jobHoursDelta: 15,
      careerDelta: 1,
      note: 'Карьера вверх',
    },
    { label: 'Отказаться' },
  ]),
  e('m3', 'Болезнь', 'Неделя вне строя.', [
    { label: 'Лечение (−15 000, −25 ч)', cashDelta: -15000, timeDelta: -25 },
  ]),
  e('m4', 'Нетворкинг', 'Ключ к сделкам.', [
    {
      label: 'Пойти (−4 000, −8 ч)',
      cashDelta: -4000,
      timeDelta: -8,
      networkDelta: 2,
    },
    { label: 'Пропуск' },
  ]),
  e('m5', 'Увольнение', 'Компания режет штат.', [
    { label: 'Принять', fireJob: true, note: 'Вы без найма' },
    {
      label: 'Выходное пособие (если связи)',
      requireNetwork: 3,
      cashDelta: 60000,
      fireJob: true,
    },
  ]),
  e('m6', 'Возврат на работу', 'Старый работодатель зовёт.', [
    {
      label: 'Вернуться',
      salaryDelta: 0,
      note: 'Найм восстановлен на базовых условиях',
      careerDelta: 0,
    },
    { label: 'Отказать (лимит отказов)', note: 'Отказ учтён' },
  ]),
  e('m7', 'Свадьба / семья', 'Новый этап.', [
    {
      label: 'Семья растёт',
      familyDelta: 1,
      expenseDelta: 12000,
      timeDelta: -15,
      note: 'Семья +1',
    },
    { label: 'Пока нет' },
  ]),
  e('m8', 'Ребёнок', 'Радость и ответственность.', [
    {
      label: 'Да',
      familyDelta: 1,
      expenseDelta: 15000,
      timeDelta: -20,
    },
    { label: 'Не сейчас' },
  ]),
  e('m9', 'Авария на бизнесе', 'Простой и убыток.', [
    {
      label: 'Чинить (−60 000)',
      cashDelta: -60000,
      note: 'Бизнес пострадал, доход временно ниже в рынке',
    },
    { label: 'Продать бизнес дёшево', sellAssetType: 'business', sellPct: 0.4 },
  ]),
  e('m10', 'Финансовый кризис', 'Рынки падают.', [
    { label: 'Переждать', note: 'Кризис бьёт по рынку' },
    { label: 'Распродажа активов', sellAssetType: 'stock', sellPct: 1 },
  ]),
  e('m11', 'Повышение квалификации обязательно', 'Иначе понижение.', [
    {
      label: 'Учиться (−20 000, −20 ч)',
      cashDelta: -20000,
      timeDelta: -20,
      eduDelta: 1,
    },
    { label: 'Риск понижения', careerDelta: -1, salaryDelta: -12000 },
  ]),
  e('m12', 'Наследство', 'Нежданный капитал.', [
    { label: 'Принять +250 000', cashDelta: 250000 },
  ]),
  e('m13', 'Судебный спор', 'Нужен юрист.', [
    { label: 'Юрист (−35 000)', cashDelta: -35000 },
    {
      label: 'Кредит на издержки',
      addLiability: {
        name: 'Юридический кредит',
        balance: 35000,
        monthlyPayment: 5000,
      },
    },
  ]),
  e('m14', 'Вирусный пост', 'Личный бренд.', [
    {
      label: 'Развить (−15 ч)',
      timeDelta: -15,
      networkDelta: 2,
      addAsset: {
        name: 'Личный бренд',
        type: 'royalty',
        cost: 0,
        monthlyIncome: 9000,
        monthlyTime: 8,
        quality: 1,
      },
    },
    { label: 'Игнор' },
  ]),
  e('m15', 'Предложение кредита', 'Дешёвые деньги?', [
    {
      label: 'Взять 200 000',
      cashDelta: 200000,
      addLiability: {
        name: 'Потребкредит',
        balance: 200000,
        monthlyPayment: 12000,
      },
    },
    { label: 'Отказ' },
  ]),
  e('m16', 'Пожар / форс-мажор', 'Имущественный удар.', [
    { label: 'Восстановить (−80 000)', cashDelta: -80000 },
    { label: 'Страховка (−время)', timeDelta: -12 },
  ]),
  e('m17', 'Привычка усилилась', 'Хуже контроль.', [
    {
      label: 'Признать',
      addHabit: { id: 'impulse', name: 'Импульсы', monthlyCost: 4000, monthlyTime: 6 },
    },
    { label: 'Сразу взять в руки', cashDelta: -5000, timeDelta: -8 },
  ]),
  e('m18', 'Переезд', 'Новый район.', [
    { label: 'Переехать (−40 000)', cashDelta: -40000, expenseDelta: 3000 },
    { label: 'Остаться' },
  ]),
]

export function pickFrom(pool: GameEvent[]): GameEvent {
  const weights = pool.map((x) => x.weight ?? 1)
  const sum = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * sum
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i]
    if (r <= 0) return structuredClone(pool[i])
  }
  return structuredClone(pool[0])
}
