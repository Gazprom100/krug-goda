import { useMemo, useState } from 'react'
import { BOARD, kindLabel } from '../game/board'
import { choiceAvailable } from '../game/choices'
import {
  describeChoiceEffects,
  pickDeclineChoice,
  choiceLockReason,
} from '../game/describeChoice'
import { cashFlow, formatMoney, freeHours } from '../game/economy'
import { moodFromPlayer } from '../game/mood'
import type { CellKind, EventChoice, GameEvent, PlayerState } from '../game/types'
import { CharacterPortrait } from './CharacterPortrait'

interface Props {
  event: GameEvent
  player: PlayerState
  onChoose: (choice: EventChoice) => void
}

function kindHint(kind: CellKind): string {
  switch (kind) {
    case 'news':
      return 'Новости: рынок, цены и внешние условия. Смотрите, что станет с кэшем, расходами и активами.'
    case 'routine':
      return 'Быт: повседневные траты и мелочи. Обычно бьют по наличным или месячным расходам.'
    case 'education':
      return 'Учёба: время и деньги → образование, навыки и сеть. Это открывает лучшие шансы позже.'
    case 'opportunity':
      return 'Шанс: активы, бизнес, крупные сделки. Проверьте требования (кэш, сеть, образование).'
    case 'dayoff':
      return 'Отдых: восстановить время, сеть или закрыть мечту — либо подработать.'
    case 'event':
      return 'Крупное событие жизни: карьера, семья, здоровье, кризисы. Эффекты сильные.'
    case 'month':
      return 'Итог месяца: зарплата, расходы и тик рынка уже учтены — выберите реакцию, если есть.'
  }
}

export function EventModal({ event, player, onChoose }: Props) {
  const choices = event.choices
  const kind = BOARD[player.position]?.kind ?? 'event'

  const available = useMemo(
    () => choices.filter((c) => choiceAvailable(player, c)),
    [choices, player],
  )

  const workable =
    available.length > 0
      ? available
      : [{ label: 'Пропуск — условия недоступны', note: 'Ни один вариант сейчас нельзя' }]

  const decline = useMemo(() => pickDeclineChoice(workable), [workable])

  const preferredIdx = Math.max(
    0,
    workable.findIndex((c) => decline == null || c.label !== decline.label),
  )
  const [selectedIdx, setSelectedIdx] = useState(preferredIdx)
  const selected = workable[Math.min(selectedIdx, workable.length - 1)] ?? workable[0]
  const effects = selected ? describeChoiceEffects(selected) : []

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="event-title">
      <div className={`modal event-card kind-${kind}`}>
        <div className="modal-shine" aria-hidden="true" />

        <div className="modal-hero">
          <CharacterPortrait
            characterId={player.characterId}
            size="md"
            mood={moodFromPlayer(player)}
            speaking
          />
          <div>
            <p className="modal-eyebrow">
              {kindLabel(kind)} · {player.name.replace(' (ИИ)', '')}
            </p>
            <h2 id="event-title">{event.title}</h2>
          </div>
        </div>

        <p className="modal-text">{event.text}</p>
        <p className="modal-kind-hint">{kindHint(kind)}</p>

        <div className="modal-snapshot" aria-label="Сейчас у вас">
          <span title="Наличные">{formatMoney(player.cash)}</span>
          <span className={cashFlow(player) >= 0 ? 'good' : 'bad'} title="Денежный поток">
            поток {cashFlow(player) >= 0 ? '+' : ''}
            {formatMoney(cashFlow(player))}/мес
          </span>
          <span title="Свободное время">{freeHours(player)} ч</span>
        </div>

        <div className="choice-list" role="listbox" aria-label="Варианты">
          {choices.map((c) => {
            const lock = choiceLockReason(player, c)
            const disabled = Boolean(lock)
            const isOn = !disabled && selected?.label === c.label
            const preview = describeChoiceEffects(c)

            return (
              <button
                key={c.label}
                type="button"
                role="option"
                aria-selected={isOn}
                disabled={disabled}
                className={`choice-row ${isOn ? 'on' : ''} ${disabled ? 'locked' : ''}`}
                onClick={() => {
                  if (disabled) return
                  const idx = workable.findIndex((a) => a.label === c.label)
                  if (idx >= 0) setSelectedIdx(idx)
                }}
                onDoubleClick={() => {
                  if (!disabled) onChoose(c)
                }}
              >
                <div className="choice-row-top">
                  <strong>{c.label}</strong>
                  {lock && <em className="choice-lock">{lock}</em>}
                </div>
                <ul className="effect-chips">
                  {preview.map((e) => (
                    <li key={`${e.tone}-${e.text}`} className={`chip ${e.tone}`}>
                      {e.text}
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>

        {selected && (
          <div className="choice-detail">
            <p className="choice-detail-label">Итог выбора «{selected.label}»:</p>
            <ul className="effect-detail">
              {effects.map((e) => (
                <li key={`${e.tone}-${e.text}`} className={e.tone}>
                  {e.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="modal-footer">
          <button
            type="button"
            className="icon-btn danger"
            title={decline?.label ?? 'Отказ'}
            onClick={() => {
              if (decline) onChoose(decline)
              else if (workable[0]) onChoose(workable[0])
            }}
          >
            ✕
          </button>
          <button
            type="button"
            className="ok-btn"
            title="Подтвердить"
            disabled={!selected}
            onClick={() => selected && onChoose(selected)}
          >
            ✓
          </button>
        </div>
        <p className="modal-primary-hint">
          ✓ подтвердить · ✕ {decline?.label ?? 'отказ'}
        </p>
      </div>
    </div>
  )
}
