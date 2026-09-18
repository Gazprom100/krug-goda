import { useState, type FormEvent } from 'react'
import {
  getCurrentUser,
  loginAccount,
  logout,
  registerAccount,
  updateProfile,
  type PublicProfile,
} from '../game/account'
import { CHARACTERS } from '../game/characters'
import { CharacterPortrait } from './CharacterPortrait'

interface Props {
  onClose: () => void
  onAuthChange: (user: PublicProfile | null) => void
  initialTab?: 'login' | 'register' | 'profile'
}

export function AuthPanel({ onClose, onAuthChange, initialTab }: Props) {
  const current = getCurrentUser()
  const [tab, setTab] = useState<'login' | 'register' | 'profile'>(
    initialTab ?? (current ? 'profile' : 'login'),
  )
  const [login, setLogin] = useState('')
  const [displayName, setDisplayName] = useState(current?.displayName ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [fav, setFav] = useState(current?.favoriteCharacterId ?? CHARACTERS[0].id)

  async function onRegister(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const res = await registerAccount({ login, displayName, password })
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    onAuthChange(res.user)
    setTab('profile')
  }

  async function onLogin(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const res = await loginAccount(login, password)
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    onAuthChange(res.user)
    setTab('profile')
    setDisplayName(res.user.displayName)
    setFav(res.user.favoriteCharacterId ?? CHARACTERS[0].id)
  }

  function onSaveProfile(e: FormEvent) {
    e.preventDefault()
    const updated = updateProfile({ displayName, favoriteCharacterId: fav })
    if (!updated) {
      setError('Сначала войдите в аккаунт')
      return
    }
    onAuthChange(updated)
    setError(null)
  }

  function onLogout() {
    logout()
    onAuthChange(null)
    setTab('login')
    setPassword('')
  }

  return (
    <div className="modal-backdrop auth-backdrop" role="dialog" aria-modal="true">
      <div className="modal event-card auth-card">
        <div className="auth-tabs">
          {!current && (
            <>
              <button type="button" className={tab === 'login' ? 'on' : ''} onClick={() => setTab('login')}>
                Вход
              </button>
              <button
                type="button"
                className={tab === 'register' ? 'on' : ''}
                onClick={() => setTab('register')}
              >
                Регистрация
              </button>
            </>
          )}
          {current && (
            <button
              type="button"
              className={tab === 'profile' ? 'on' : ''}
              onClick={() => setTab('profile')}
            >
              Профиль
            </button>
          )}
          <button type="button" className="auth-close" onClick={onClose} title="Закрыть">
            ✕
          </button>
        </div>

        {error && <p className="auth-error">{error}</p>}

        {tab === 'register' && (
          <form className="auth-form" onSubmit={onRegister}>
            <h2>Регистрация</h2>
            <p className="auth-note">
              Аккаунт хранится на этом устройстве в браузере. Облачный сервер можно подключить
              позже.
            </p>
            <label>
              Логин
              <input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" />
            </label>
            <label>
              Имя в игре
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="nickname"
              />
            </label>
            <label>
              Пароль
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <button type="submit" className="landing-primary" disabled={busy}>
              Создать аккаунт
            </button>
          </form>
        )}

        {tab === 'login' && (
          <form className="auth-form" onSubmit={onLogin}>
            <h2>Вход</h2>
            <label>
              Логин
              <input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" />
            </label>
            <label>
              Пароль
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            <button type="submit" className="landing-primary" disabled={busy}>
              Войти
            </button>
            <button type="button" className="ghost" onClick={() => setTab('register')}>
              Нет аккаунта? Зарегистрироваться
            </button>
          </form>
        )}

        {tab === 'profile' && current && (
          <form className="auth-form" onSubmit={onSaveProfile}>
            <h2>Профиль</h2>
            <div className="profile-head">
              <CharacterPortrait characterId={fav} size="lg" mood="happy" />
              <div>
                <p className="profile-login">@{current.login}</p>
                <p className="sheet-note">
                  Партий: {current.gamesPlayed} · побед: {current.wins}
                </p>
              </div>
            </div>
            <label>
              Имя в игре
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </label>
            <p className="auth-label">Любимый герой</p>
            <div className="profile-favs">
              {CHARACTERS.slice(0, 8).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={fav === c.id ? 'on' : ''}
                  onClick={() => setFav(c.id)}
                  title={c.name}
                >
                  <CharacterPortrait characterId={c.id} size="xs" />
                </button>
              ))}
            </div>
            <button type="submit" className="landing-primary">
              Сохранить
            </button>
            <button type="button" className="ghost" onClick={onLogout}>
              Выйти из аккаунта
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
