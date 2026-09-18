import { useEffect, useRef, useState } from 'react'
import { Ambient } from './components/Ambient'
import { AuthPanel } from './components/AuthPanel'
import { Board } from './components/Board'
import { CharacterPortrait } from './components/CharacterPortrait'
import { Dice } from './components/Dice'
import { DreamArt } from './components/DreamArt'
import { EventModal } from './components/EventModal'
import { PauseMenu } from './components/PauseMenu'
import { SetupScreen } from './components/SetupScreen'
import { SideLedger } from './components/SideLedger'
import { VictoryBurst } from './components/VictoryBurst'
import { WinMeter } from './components/WinMeter'
import { getCurrentUser, recordGameResult, type PublicProfile } from './game/account'
import { moodFromPlayer } from './game/mood'
import { BALANCE } from './game/balance'
import { stepAi } from './game/aiTurn'
import {
  applyChoice,
  buyDreamManual,
  clearToast,
  dismissTutorial,
  formatMoney,
  rollDice,
  setWorkMode,
  startGame,
} from './game/engine'
import { clearSave, loadGame, saveGame } from './game/save'
import type { GameState, WorkMode } from './game/types'
import { RETIRE_AGE, WIN_CASH, WIN_FREE_HOURS } from './game/types'
import './App.css'

export default function App() {
  const [state, setState] = useState<GameState | null>(() => loadGame())
  const [user, setUser] = useState<PublicProfile | null>(() => getCurrentUser())
  const [dicePulse, setDicePulse] = useState(false)
  const [shake, setShake] = useState(false)
  const [railTab, setRailTab] = useState<'log' | 'work' | 'market'>('log')
  const [pauseOpen, setPauseOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<'board' | 'profile' | 'more'>('board')
  const recordedFinish = useRef(false)

  useEffect(() => {
    if (state?.phase === 'playing' || state?.phase === 'finished') {
      saveGame(state)
    }
  }, [state])

  useEffect(() => {
    if (!state || state.phase !== 'finished' || recordedFinish.current) return
    recordedFinish.current = true
    const human = state.players.find((p) => !p.isAi)
    const won = Boolean(human && state.winnerIds.includes(human.id))
    recordGameResult(won)
    setUser(getCurrentUser())
  }, [state])

  useEffect(() => {
    if (!state?.lastToast) return
    const t = window.setTimeout(() => {
      setState((s) => (s ? clearToast(s) : s))
    }, 2800)
    return () => window.clearTimeout(t)
  }, [state?.lastToast])

  useEffect(() => {
    if (!state || state.phase !== 'playing') return
    const active = state.players[state.activeIndex]
    if (active?.pendingEvent && !active.isAi) setMobileTab('board')
  }, [state])

  useEffect(() => {
    if (!state || state.phase !== 'playing') return
    const active = state.players[state.activeIndex]
    if (!active?.isAi || !active.alive || active.won) return

    const delay = active.pendingEvent ? BALANCE.aiChoiceMs : BALANCE.aiThinkMs
    const t = window.setTimeout(() => {
      if (!active.pendingEvent) {
        setDicePulse(true)
        setShake(true)
        window.setTimeout(() => setShake(false), 280)
        window.setTimeout(() => setDicePulse(false), 950)
      }
      setState((s) => (s ? stepAi(s) : s))
    }, delay)
    return () => window.clearTimeout(t)
  }, [state])

  function goMainMenu(clear = false) {
    setPauseOpen(false)
    setAuthOpen(false)
    if (clear) clearSave()
    setState(null)
    recordedFinish.current = false
  }

  if (!state || state.phase === 'setup') {
    return (
      <>
        <Ambient />
        <div className="app setup-app play-world">
          <SetupScreen
            user={user}
            onAuthChange={setUser}
            onStart={(characterIds, dreamIds, aiFlags) => {
              clearSave()
              recordedFinish.current = false
              setState(
                startGame(characterIds, dreamIds, aiFlags, getCurrentUser()?.displayName),
              )
            }}
            onContinue={() => {
              const s = loadGame()
              if (s && s.phase !== 'setup') {
                recordedFinish.current = s.phase === 'finished'
                setState(s)
              }
            }}
          />
        </div>
      </>
    )
  }

  const active = state.players[state.activeIndex]
  const viewed = state.players[state.viewIndex] ?? active
  const humanTurn = !active.isAi
  const locked =
    Boolean(active.pendingEvent) ||
    state.phase !== 'playing' ||
    !active.alive ||
    active.won ||
    !humanTurn

  const tip = tipFor(state, active, humanTurn, locked)

  function onRoll() {
    setDicePulse(true)
    setShake(true)
    window.setTimeout(() => setShake(false), 280)
    window.setTimeout(() => setDicePulse(false), 950)
    setState((s) => (s ? rollDice(s) : s))
  }

  return (
    <>
      <Ambient />
      <VictoryBurst show={state.phase === 'finished' && state.winnerIds.length > 0} />
      <div className={`app playing desk mobile-${mobileTab} ${shake ? 'app-shake' : ''}`}>
        <header className="desk-top">
          <div className="desk-brand">
            <span className="desk-logo">Круг Года</span>
            <span className="desk-year">Год {state.year}</span>
          </div>

          <div className="desk-seats">
            {state.players.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                className={`seat-chip ${idx === state.activeIndex ? 'active' : ''} ${idx === state.viewIndex ? 'viewing' : ''} ${p.won ? 'won' : ''} ${!p.alive ? 'out' : ''}`}
                onClick={() => setState((s) => (s ? { ...s, viewIndex: idx } : s))}
              >
                <CharacterPortrait
                  characterId={p.characterId}
                  size="sm"
                  mood={moodFromPlayer(p)}
                  speaking={idx === state.activeIndex && Boolean(p.pendingEvent)}
                />
                <span className="seat-meta">
                  <strong>{p.name.replace(' (ИИ)', '')}</strong>
                  <em>{formatMoney(p.cash)}</em>
                </span>
              </button>
            ))}
          </div>

          <div className="desk-status">
            <div className="desk-actions">
              <button
                type="button"
                className="desk-menu-btn"
                onClick={() => setAuthOpen(true)}
                title="Профиль"
              >
                {user ? user.displayName : 'Профиль'}
              </button>
              <button
                type="button"
                className="desk-menu-btn primary-outline"
                onClick={() => setPauseOpen(true)}
              >
                Меню
              </button>
            </div>
            <p className="desk-turn">
              Ходит <strong>{active.name}</strong>
              {active.isAi ? ' · ИИ' : ''}
            </p>
            {(tip || state.showTutorial) && (
              <div className="desk-tip">
                {state.showTutorial ? (
                  <>
                    Победа: мечта + поток &gt; 0 + {formatMoney(WIN_CASH)} + ≥{WIN_FREE_HOURS} ч до{' '}
                    {RETIRE_AGE} лет.
                    <button
                      type="button"
                      className="ok-btn sm"
                      onClick={() => setState((s) => (s ? dismissTutorial(s) : s))}
                    >
                      ✓
                    </button>
                  </>
                ) : (
                  tip
                )}
              </div>
            )}
          </div>
        </header>

        {state.lastToast && <div className="toast desk-toast">{state.lastToast}</div>}

        {state.phase === 'finished' && (
          <div className="banner won">
            Партия завершена.{' '}
            {state.winnerIds.length
              ? `Победители: ${state.players
                  .filter((p) => state.winnerIds.includes(p.id))
                  .map((p) => p.name)
                  .join(', ')}`
              : 'Победителей нет — время вышло.'}
            <button type="button" onClick={() => goMainMenu(true)}>
              В меню
            </button>
          </div>
        )}

        <div className="desk-grid">
          <SideLedger player={viewed} />

          <main className="desk-stage">
            <Board state={state} rolling={dicePulse} />

            <div className="desk-action">
              <button
                type="button"
                className={`roll-btn ${dicePulse ? 'pulse' : ''} ${locked ? 'locked' : ''}`}
                disabled={locked}
                onClick={onRoll}
              >
                <Dice value={active.lastRoll ?? 1} rolling={dicePulse} size="md" />
                <span>
                  {humanTurn ? (locked ? 'Событие…' : 'Бросить кубик') : 'Ход ИИ…'}
                </span>
              </button>
              <WinMeter player={viewed} compact />
            </div>
          </main>

          <aside className="desk-rail">
            <div className="rail-tabs">
              <button
                type="button"
                className={railTab === 'log' ? 'on' : ''}
                onClick={() => setRailTab('log')}
              >
                Журнал
              </button>
              <button
                type="button"
                className={railTab === 'work' ? 'on' : ''}
                onClick={() => setRailTab('work')}
              >
                Работа
              </button>
              <button
                type="button"
                className={railTab === 'market' ? 'on' : ''}
                onClick={() => setRailTab('market')}
              >
                Рынок
              </button>
            </div>

            <div className="rail-body">
              {railTab === 'log' && (
                <div className="game-log paper desk-log">
                  <ul>
                    {viewed.log.slice(0, 8).map((e) => (
                      <li key={e.id}>{e.text}</li>
                    ))}
                    {viewed.log.length === 0 && (
                      <li className="muted">Пока тихо — бросайте кубик</li>
                    )}
                  </ul>
                </div>
              )}

              {railTab === 'work' && (
                <div className="rail-panel">
                  <h3>Режим работы</h3>
                  <div className="btn-row wrap">
                    {(
                      [
                        ['job', 'Найм'],
                        ['freelance', 'Фриланс'],
                        ['business', 'Бизнес'],
                        ['none', 'Без работы'],
                      ] as [WorkMode, string][]
                    ).map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        className={active.workMode === mode ? 'active' : ''}
                        disabled={locked}
                        onClick={() => setState((s) => (s ? setWorkMode(s, mode) : s))}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="primary dream-buy"
                    disabled={locked || active.dreamBought || active.cash < active.dreamCost}
                    onClick={() => setState((s) => (s ? buyDreamManual(s) : s))}
                  >
                    {active.dreamBought
                      ? `Мечта ✓ ${active.dreamName}`
                      : `Купить мечту · ${formatMoney(active.dreamCost)}`}
                  </button>
                </div>
              )}

              {railTab === 'market' && (
                <div className="rail-panel">
                  <h3>Рынок</h3>
                  <DreamArt dreamId={active.dreamId} name={active.dreamName} className="util-dream" />
                  <p className="sheet-note">
                    {active.dreamName}
                    {active.dreamBought ? ' ✓' : ` · ${formatMoney(active.dreamCost)}`}
                  </p>
                  <div className="market-chips">
                    <span>акции ×{state.market.stocks.toFixed(2)}</span>
                    <span>недв. ×{state.market.realty.toFixed(2)}</span>
                    <span>крипто ×{state.market.crypto.toFixed(2)}</span>
                    <span>арт ×{state.market.art.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        <nav className="mobile-nav" aria-label="Мобильная навигация">
          <button
            type="button"
            className={mobileTab === 'board' ? 'on' : ''}
            onClick={() => setMobileTab('board')}
          >
            <span className="mobile-nav-ico">◎</span>
            Доска
          </button>
          <button
            type="button"
            className={mobileTab === 'profile' ? 'on' : ''}
            onClick={() => setMobileTab('profile')}
          >
            <span className="mobile-nav-ico">☺</span>
            Герой
          </button>
          <button
            type="button"
            className={mobileTab === 'more' ? 'on' : ''}
            onClick={() => setMobileTab('more')}
          >
            <span className="mobile-nav-ico">☰</span>
            Ещё
          </button>
        </nav>

        {active.pendingEvent && humanTurn && (
          <EventModal
            key={active.pendingEvent.id}
            event={active.pendingEvent}
            player={active}
            onChoose={(choice) => setState((s) => (s ? applyChoice(s, choice) : s))}
          />
        )}

        <PauseMenu
          open={pauseOpen}
          user={user}
          onContinue={() => setPauseOpen(false)}
          onProfile={() => {
            setPauseOpen(false)
            setAuthOpen(true)
          }}
          onMainMenu={() => {
            saveGame(state)
            goMainMenu(false)
          }}
        />

        {authOpen && (
          <AuthPanel
            initialTab={user ? 'profile' : 'login'}
            onClose={() => setAuthOpen(false)}
            onAuthChange={setUser}
          />
        )}
      </div>
    </>
  )
}

function tipFor(
  state: GameState,
  active: GameState['players'][number],
  humanTurn: boolean,
  locked: boolean,
): string | null {
  if (state.phase === 'finished') return null
  if (state.showTutorial) return null
  if (active.pendingEvent && humanTurn) return 'Выберите действие и нажмите ✓'
  if (!humanTurn) return `Ход ${active.name} (ИИ)`
  if (!locked) return 'Бросьте кубик, чтобы продолжить'
  return null
}
