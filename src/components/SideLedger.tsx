import { useState, type ReactNode } from 'react'
import {
  carExpense,
  cashFlow,
  familyExpense,
  formatMoney,
  freeHours,
  hourlyRate,
  passiveIncome,
  timeUsed,
  totalExpenses,
  totalIncome,
  workIncome,
} from '../game/economy'
import { moodFromPlayer } from '../game/mood'
import type { PlayerState } from '../game/types'
import { CharacterPortrait } from './CharacterPortrait'
import { AnimatedNumber } from './AnimatedNumber'

type Tab = 'overview' | 'income' | 'expenses' | 'assets' | 'time' | 'career'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Сводка', icon: '⚖' },
  { id: 'income', label: 'Доходы', icon: '↑' },
  { id: 'expenses', label: 'Расходы', icon: '↓' },
  { id: 'assets', label: 'Активы', icon: '⌂' },
  { id: 'time', label: 'Время', icon: '◷' },
  { id: 'career', label: 'Карьера', icon: 'necktie' },
]

interface Props {
  player: PlayerState
}

export function SideLedger({ player: p }: Props) {
  const [tab, setTab] = useState<Tab>('overview')
  const flow = cashFlow(p)
  const income = totalIncome(p)
  const expenses = totalExpenses(p)

  return (
    <aside className="ledger" aria-label="Тетрадь баланса">
      <div className="ledger-main">
        <header className="ledger-head">
          <CharacterPortrait
            characterId={p.characterId}
            size="lg"
            mood={moodFromPlayer(p)}
          />
          <div className="ledger-identity">
            <h2>{p.name.replace(' (ИИ)', '')}</h2>
            <p>
              {p.age} лет · {p.jobTitle}
            </p>
            <p className="ledger-cash">
              <AnimatedNumber value={p.cash} format={formatMoney} />
            </p>
          </div>
        </header>

        {tab === 'overview' && (
          <>
          <dl className="ledger-list">
            <Row label="Наличные" value={<AnimatedNumber value={p.cash} format={formatMoney} />} tone={p.cash < 0 ? 'bad' : 'good'} />
            <Row label="Денежный поток" value={`${flow >= 0 ? '+' : ''}${formatMoney(flow)}`} tone={flow < 0 ? 'bad' : 'good'} />
            <Row label="Доходы" value={formatMoney(income)} />
            <Row label="Расходы" value={formatMoney(expenses)} tone="bad" />
            <Row label="Пассив" value={formatMoney(passiveIncome(p))} tone="good" />
            <Row label="Свободное время" value={`${freeHours(p)} ч`} />
            <Row label="Почасовая" value={`${formatMoney(hourlyRate(p))}/ч`} />
            <Row label="Мечта" value={p.dreamBought ? `${p.dreamName} ✓` : p.dreamName} />
          </dl>
          <div className="ledger-dream-wrap">
            <img
              src={`/dreams/dream-${p.dreamId}.png`}
              alt={p.dreamName}
              className="ledger-dream-img"
            />
          </div>
          </>
        )}

        {tab === 'income' && (
          <div className="ledger-block">
            <h3>Доходы</h3>
            <p className="ledger-total">Всего: {formatMoney(income)}</p>
            <ul>
              <li>
                <span>Работа: {p.jobTitle}</span>
                <b>{formatMoney(workIncome(p))}</b>
              </li>
              {p.assets.map((a) => (
                <li key={a.id}>
                  <span>{a.name}</span>
                  <b className="good">+{formatMoney(a.monthlyIncome)}</b>
                </li>
              ))}
              {p.assets.length === 0 && workIncome(p) === 0 && (
                <li className="muted">Пока только зарплата / нет дохода</li>
              )}
            </ul>
          </div>
        )}

        {tab === 'expenses' && (
          <div className="ledger-block">
            <h3>Расходы</h3>
            <p className="ledger-total bad">Всего: −{formatMoney(expenses)}</p>
            <ul>
              <li>
                <span>Быт и корзина</span>
                <b>−{formatMoney(p.baseExpenses)}</b>
              </li>
              {p.familySize > 0 && (
                <li>
                  <span>Семья ×{p.familySize}</span>
                  <b>−{formatMoney(familyExpense(p))}</b>
                </li>
              )}
              {p.hasCar && (
                <li>
                  <span>Авто</span>
                  <b>−{formatMoney(carExpense(p))}</b>
                </li>
              )}
              {p.habits.map((h) => (
                <li key={h.id}>
                  <span>{h.name}</span>
                  <b>−{formatMoney(h.monthlyCost)}</b>
                </li>
              ))}
              {p.liabilities.map((l) => (
                <li key={l.id}>
                  <span>{l.name}</span>
                  <b>−{formatMoney(l.monthlyPayment)}</b>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'assets' && (
          <div className="ledger-block">
            <h3>Активы и долги</h3>
            <ul>
              {p.assets.length === 0 && <li className="muted">Активов пока нет</li>}
              {p.assets.map((a) => (
                <li key={a.id}>
                  <span>
                    {a.name} <em>({a.type})</em>
                  </span>
                  <b>{formatMoney(a.marketValue)}</b>
                </li>
              ))}
            </ul>
            <h3>Обязательства</h3>
            <ul>
              {p.liabilities.length === 0 && <li className="muted">Долгов нет</li>}
              {p.liabilities.map((l) => (
                <li key={l.id}>
                  <span>{l.name}</span>
                  <b className="bad">{formatMoney(l.balance)}</b>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'time' && (
          <div className="ledger-block">
            <h3>Время</h3>
            <p className="ledger-total">
              Свободно: {freeHours(p)} / {p.timeCap} ч
            </p>
            <ul>
              <li>
                <span>Занято всего</span>
                <b>−{timeUsed(p)} ч</b>
              </li>
              <li>
                <span>Работа</span>
                <b>−{p.jobHours} ч</b>
              </li>
              {p.assets.map((a) =>
                a.monthlyTime > 0 ? (
                  <li key={a.id}>
                    <span>{a.name}</span>
                    <b>−{a.monthlyTime} ч</b>
                  </li>
                ) : null,
              )}
              {p.habits.map((h) => (
                <li key={h.id}>
                  <span>{h.name}</span>
                  <b>−{h.monthlyTime} ч</b>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'career' && (
          <div className="ledger-block">
            <h3>Карьера</h3>
            <ul>
              <li>
                <span>Должность</span>
                <b>{p.jobTitle}</b>
              </li>
              <li>
                <span>Уровень</span>
                <b>{p.careerLevel}</b>
              </li>
              <li>
                <span>Образование</span>
                <b>{p.eduLevel}</b>
              </li>
              <li>
                <span>Профнавыки</span>
                <b>{p.proSkills}</b>
              </li>
              <li>
                <span>Сеть</span>
                <b>{p.network}</b>
              </li>
              <li>
                <span>Режим</span>
                <b>{p.workMode}</b>
              </li>
            </ul>
          </div>
        )}
      </div>

      <nav className="ledger-tabs" aria-label="Разделы тетради">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'on' : ''}
            title={t.label}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-ico" data-tab={t.id}>
              {t.id === 'career' ? '👔' : t.icon}
            </span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

function Row({
  label,
  value,
  tone,
}: {
  label: string
  value: ReactNode
  tone?: 'good' | 'bad'
}) {
  return (
    <div className="ledger-row">
      <dt>{label}</dt>
      <dd className={tone}>{value}</dd>
    </div>
  )
}
