import { useEffect, useState } from 'react'
import { CHARACTERS } from '../game/characters'
import { DREAMS } from '../game/dreams'
import { formatMoney } from '../game/economy'
import { clearSave, loadGame } from '../game/save'
import { getCurrentUser, type PublicProfile } from '../game/account'
import { CharacterPortrait } from './CharacterPortrait'
import { DreamArt } from './DreamArt'
import { AuthPanel } from './AuthPanel'

interface Props {
  onStart: (characterIds: string[], dreamIds: string[], aiFlags: boolean[]) => void
  onContinue: () => void
  user: PublicProfile | null
  onAuthChange: (user: PublicProfile | null) => void
}

type Screen = 'menu' | 'hero' | 'dream' | 'party'

export function SetupScreen({ onStart, onContinue, user, onAuthChange }: Props) {
  const [screen, setScreen] = useState<Screen>('menu')
  const [heroIdx, setHeroIdx] = useState(0)
  const [dreamIdx, setDreamIdx] = useState(0)
  const [bots, setBots] = useState(0)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'profile'>('login')
  const hasSave = Boolean(loadGame())

  useEffect(() => {
    if (!user?.favoriteCharacterId) return
    const idx = CHARACTERS.findIndex((c) => c.id === user.favoriteCharacterId)
    if (idx >= 0) setHeroIdx(idx)
  }, [user?.favoriteCharacterId])

  const hero = CHARACTERS[heroIdx]
  const dreamList = DREAMS.filter((d) => hero.dreamOptions.includes(d.id))
  const currentDream = dreamList[dreamIdx % dreamList.length] ?? DREAMS[0]

  function cycleHero(dir: number) {
    setHeroIdx((i) => (i + dir + CHARACTERS.length) % CHARACTERS.length)
    setDreamIdx(0)
  }

  function cycleDream(dir: number) {
    setDreamIdx((i) => (i + dir + dreamList.length) % dreamList.length)
  }

  function launch() {
    const characterIds = [hero.id]
    const dreamIds = [currentDream.id]
    const aiFlags = [false]
    const used = new Set([hero.id])
    for (let b = 0; b < bots; b++) {
      const pool = CHARACTERS.filter((c) => !used.has(c.id))
      const c = pool[b % pool.length] ?? CHARACTERS[0]
      used.add(c.id)
      characterIds.push(c.id)
      dreamIds.push(c.dreamOptions[0] ?? 'studio')
      aiFlags.push(true)
    }
    clearSave()
    onStart(characterIds, dreamIds, aiFlags)
  }

  function openAuth(tab: 'login' | 'register' | 'profile') {
    setAuthTab(tab)
    setAuthOpen(true)
  }

  if (screen === 'menu') {
    return (
      <>
        <div className="landing">
          <div className="landing-bg" aria-hidden="true">
            <img src="/landing-hero.png" alt="" />
            <div className="landing-wash" />
          </div>
          <div className="landing-content">
            <p className="landing-brand">Круг Года</p>
            <h1 className="landing-title">Год жизни. Один кубик. Путь к пассиву.</h1>
            <p className="landing-lead">
              Финсим на кольце 12 месяцев: время, деньги, карьера и мечта — в современном браузере.
            </p>

            {user ? (
              <button type="button" className="landing-user" onClick={() => openAuth('profile')}>
                Профиль · {user.displayName}
              </button>
            ) : (
              <div className="landing-auth-row">
                <button type="button" className="landing-secondary" onClick={() => openAuth('login')}>
                  Войти
                </button>
                <button type="button" className="landing-secondary" onClick={() => openAuth('register')}>
                  Регистрация
                </button>
              </div>
            )}

            <div className="landing-cta">
              <button
                type="button"
                className="landing-primary"
                onClick={() => {
                  if (!getCurrentUser()) openAuth('register')
                  else setScreen('hero')
                }}
              >
                Начать путь
              </button>
              <button
                type="button"
                className="landing-secondary"
                disabled={!hasSave}
                onClick={onContinue}
              >
                Продолжить
              </button>
            </div>
            <div className="landing-links">
              <button type="button" onClick={() => setScreen('party')}>
                Партия с ботами
              </button>
              <button
                type="button"
                onClick={() =>
                  alert(
                    'Круг Года — оригинальный браузерный финсим. Цель: мечта, положительный поток, капитал и свободное время.',
                  )
                }
              >
                Об игре
              </button>
            </div>
            {!user && (
              <p className="landing-guest-hint">
                Для новой игры нужна регистрация (аккаунт на этом устройстве).
              </p>
            )}
          </div>
        </div>
        {authOpen && (
          <AuthPanel
            initialTab={authTab}
            onClose={() => setAuthOpen(false)}
            onAuthChange={(u) => {
              onAuthChange(u)
              if (u) setAuthOpen(false)
            }}
          />
        )}
      </>
    )
  }

  if (screen === 'party') {
    return (
      <div className="setup-flow compact-setup">
        <div className="tip-banner">Сколько ИИ-соперников?</div>
        <div className="select-card">
          <h2>Партия</h2>
          <div className="btn-row">
            {[0, 1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                className={bots === n ? 'active' : ''}
                onClick={() => setBots(n)}
              >
                {n === 0 ? 'Соло' : `${n} бот${n > 1 ? 'а' : ''}`}
              </button>
            ))}
          </div>
          <div className="select-actions">
            <button type="button" className="icon-btn" onClick={() => setScreen('menu')}>
              ←
            </button>
            <button type="button" className="ok-btn" onClick={() => setScreen('hero')}>
              ✓
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'dream') {
    return (
      <div className="setup-flow compact-setup">
        <div className="tip-banner">Выберите мечту — цель партии</div>
        <div className="select-card dream-card">
          <p className="select-eyebrow">
            {user?.displayName ?? hero.name} мечтает о…
          </p>
          <div className="carousel dream-carousel">
            <button type="button" className="nav-arrow" onClick={() => cycleDream(-1)}>
              ‹
            </button>
            <div className="dream-showcase">
              <DreamArt dreamId={currentDream.id} name={currentDream.name} />
              <div className="dream-copy">
                <h2>{currentDream.name}</h2>
                <p className="dream-price">{formatMoney(currentDream.cost)}</p>
                <p className="dream-blurb">{currentDream.blurb}</p>
              </div>
            </div>
            <button type="button" className="nav-arrow" onClick={() => cycleDream(1)}>
              ›
            </button>
          </div>
          <div className="select-actions">
            <button type="button" className="icon-btn" onClick={() => setScreen('hero')}>
              ←
            </button>
            <button type="button" className="ok-btn" onClick={launch}>
              ✓
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="setup-flow compact-setup">
      <div className="tip-banner">Выберите героя</div>
      <div className="select-card hero-card">
        <div className="select-top">
          <button type="button" className="nav-arrow" onClick={() => cycleHero(-1)}>
            ‹
          </button>
          <h2>Герой · {hero.name}</h2>
          <button type="button" className="nav-arrow" onClick={() => cycleHero(1)}>
            ›
          </button>
        </div>
        <div className="hero-layout">
          <CharacterPortrait characterId={hero.id} size="lg" mood="happy" />
          <div className="hero-stats">
            <p className="cast-blurb">{hero.blurb}</p>
            <dl className="stat-grid">
              <div>
                <dt>Наличные</dt>
                <dd>{formatMoney(hero.cash)}</dd>
              </div>
              <div>
                <dt>Оклад</dt>
                <dd>{formatMoney(hero.salary)}</dd>
              </div>
              <div>
                <dt>Свободно</dt>
                <dd>{hero.timePerMonth - hero.jobHours} ч</dd>
              </div>
              <div>
                <dt>Возраст</dt>
                <dd>{hero.age} лет</dd>
              </div>
            </dl>
            <p className="sheet-note">
              {hero.jobTitle} · {hero.difficulty}
              {bots > 0 ? ` · ИИ: ${bots}` : ''}
              {user ? ` · вы: ${user.displayName}` : ''}
            </p>
          </div>
        </div>
        <div className="select-actions">
          <button type="button" className="icon-btn" onClick={() => setScreen('menu')}>
            ←
          </button>
          <button type="button" className="ok-btn" onClick={() => setScreen('dream')}>
            ✓
          </button>
        </div>
      </div>
    </div>
  )
}
