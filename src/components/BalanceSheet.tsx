import type { PlayerState } from '../game/types'
import { AnimatedNumber } from './AnimatedNumber'
import { CharacterPortrait } from './CharacterPortrait'
import { moodFromPlayer } from '../game/mood'
import {
  cashFlow,
  formatMoney,
  freeHours,
  hourlyRate,
  netWorth,
  passiveIncome,
  timeUsed,
  totalExpenses,
  totalIncome,
} from '../game/engine'

interface Props {
  player: PlayerState
}

export function BalanceSheet({ player: p }: Props) {
  const flow = cashFlow(p)

  return (
    <aside className="sheet" aria-label="Баланс">
      <div className="sheet-head">
        <CharacterPortrait
          characterId={p.characterId}
          size="md"
          mood={moodFromPlayer(p)}
          speaking={Boolean(p.pendingEvent)}
        />
        <div>
          <h2>{p.name}</h2>
          <p className="sheet-note">
            {p.age} лет · {p.jobTitle}
          </p>
        </div>
      </div>

      <dl className="sheet-grid">
        <div className="money-row">
          <dt>Деньги</dt>
          <dd className={p.cash < 0 ? 'bad' : 'good'}>
            <AnimatedNumber value={p.cash} format={formatMoney} />
          </dd>
        </div>
        <div>
          <dt>Доход / мес</dt>
          <dd>
            <AnimatedNumber value={totalIncome(p)} format={formatMoney} />
          </dd>
        </div>
        <div>
          <dt>Расходы / мес</dt>
          <dd>
            <AnimatedNumber value={totalExpenses(p)} format={formatMoney} />
          </dd>
        </div>
        <div>
          <dt>Денежный поток</dt>
          <dd className={flow < 0 ? 'bad' : 'good'}>
            <AnimatedNumber
              value={flow}
              format={(n) => `${n >= 0 ? '+' : ''}${formatMoney(n)}`}
            />
          </dd>
        </div>
        <div>
          <dt>Пассив</dt>
          <dd className="good">
            <AnimatedNumber value={passiveIncome(p)} format={formatMoney} />
          </dd>
        </div>
        <div>
          <dt>Капитал</dt>
          <dd>
            <AnimatedNumber value={netWorth(p)} format={formatMoney} />
          </dd>
        </div>
        <div>
          <dt>Время занято / лимит</dt>
          <dd>
            {timeUsed(p)} / {p.timeCap} ч
          </dd>
        </div>
        <div>
          <dt>Свободные часы</dt>
          <dd className={freeHours(p) < 0 ? 'bad' : ''}>{freeHours(p)} ч</dd>
        </div>
        <div>
          <dt>Почасовая</dt>
          <dd>{formatMoney(hourlyRate(p))}/ч</dd>
        </div>
        <div>
          <dt>Сеть / обр. / проф.</dt>
          <dd>
            {p.network} · {p.eduLevel} · {p.proSkills}
          </dd>
        </div>
        <div>
          <dt>Семья / авто</dt>
          <dd>
            {p.familySize} чел. · {p.hasCar ? 'есть авто' : 'без авто'}
          </dd>
        </div>
      </dl>

      <h3>Привычки</h3>
      {p.habits.length === 0 ? (
        <p className="sheet-empty">Нет</p>
      ) : (
        <ul className="sheet-list">
          {p.habits.map((h) => (
            <li key={h.id}>
              <strong>{h.name}</strong>
              <span>
                −{formatMoney(h.monthlyCost)} · −{h.monthlyTime} ч
              </span>
            </li>
          ))}
        </ul>
      )}

      <h3>Активы</h3>
      {p.assets.length === 0 ? (
        <p className="sheet-empty">Пока нет</p>
      ) : (
        <ul className="sheet-list">
          {p.assets.map((a) => (
            <li key={a.id} className="asset-row">
              <strong>
                {a.name} <em>({a.type})</em>
              </strong>
              <span>
                рын. {formatMoney(a.marketValue)} · +{formatMoney(a.monthlyIncome)} ·{' '}
                {a.monthlyTime} ч
              </span>
            </li>
          ))}
        </ul>
      )}

      <h3>Обязательства</h3>
      {p.liabilities.length === 0 ? (
        <p className="sheet-empty">Нет долгов</p>
      ) : (
        <ul className="sheet-list">
          {p.liabilities.map((l) => (
            <li key={l.id}>
              <strong>{l.name}</strong>
              <span>
                {formatMoney(l.balance)} · −{formatMoney(l.monthlyPayment)}/мес
              </span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
