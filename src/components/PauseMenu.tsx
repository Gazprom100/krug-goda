import type { PublicProfile } from '../game/account'

interface Props {
  open: boolean
  user: PublicProfile | null
  onContinue: () => void
  onProfile: () => void
  onMainMenu: () => void
}

/** Пауза / выход в меню во время партии */
export function PauseMenu({ open, user, onContinue, onProfile, onMainMenu }: Props) {
  if (!open) return null
  return (
    <div className="modal-backdrop pause-backdrop" role="dialog" aria-modal="true">
      <div className="modal event-card pause-card">
        <h2>Меню</h2>
        {user && <p className="sheet-note">Вы вошли как {user.displayName}</p>}
        <div className="pause-actions">
          <button type="button" className="landing-primary" onClick={onContinue}>
            Продолжить игру
          </button>
          <button type="button" className="menu-btn" onClick={onProfile}>
            Мой профиль
          </button>
          <button type="button" className="menu-btn" onClick={onMainMenu}>
            В главное меню
          </button>
          <p className="pause-hint">
            Чтобы закрыть вкладку игры — закройте окно браузера (⌘W / Ctrl+W).
          </p>
        </div>
      </div>
    </div>
  )
}
