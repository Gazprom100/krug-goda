import { freeHours, winProgress } from '../game/engine'
import { formatMoney } from '../game/economy'
import type { PlayerState } from '../game/types'
import { WIN_CASH, WIN_FREE_HOURS } from '../game/types'

interface Props {
  player: PlayerState
  compact?: boolean
}

export function WinMeter({ player, compact }: Props) {
  const p = winProgress(player)
  const cashPct = Math.min(100, Math.round((Math.max(0, player.cash) / WIN_CASH) * 100))
  const free = freeHours(player)
  const timePct = Math.min(100, Math.round((Math.max(0, free) / WIN_FREE_HOURS) * 100))

  if (compact) {
    return (
      <div className="win-meter compact" aria-label="Прогресс победы">
        <Meter ok={p.dream} label="Мечта" value={p.dream ? 100 : 0} short />
        <Meter ok={p.cashFlowOk} label="Поток" value={p.cashFlowOk ? 100 : 25} short />
        <Meter ok={p.cashOk} label="Кэш" value={cashPct} short />
        <Meter ok={p.timeOk} label="Время" value={timePct} short />
      </div>
    )
  }

  return (
    <div className="win-meter" aria-label="Прогресс победы">
      <Meter ok={p.dream} label="Мечта" value={p.dream ? 100 : 0} />
      <Meter ok={p.cashFlowOk} label="Поток > 0" value={p.cashFlowOk ? 100 : 25} />
      <Meter ok={p.cashOk} label={`Кэш ${formatMoney(WIN_CASH)}`} value={cashPct} />
      <Meter ok={p.timeOk} label={`Свободно ${WIN_FREE_HOURS} ч`} value={timePct} />
    </div>
  )
}

function Meter({
  label,
  value,
  ok,
  short,
}: {
  label: string
  value: number
  ok: boolean
  short?: boolean
}) {
  const v = Math.min(100, Math.max(0, value))
  return (
    <div className={`meter ${ok ? 'ok' : ''} ${short ? 'short' : ''}`}>
      <div className="meter-top">
        <span>{label}</span>
        <span>{v}%</span>
      </div>
      <div className="meter-bar">
        <i style={{ width: `${v}%` }} />
      </div>
    </div>
  )
}
