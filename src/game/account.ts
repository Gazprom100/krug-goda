/** Локальный аккаунт на устройстве (без сервера). Данные в localStorage. */

const USERS_KEY = 'krug-goda-users-v1'
const SESSION_KEY = 'krug-goda-session-v1'

export interface UserAccount {
  id: string
  login: string
  displayName: string
  passwordHash: string
  createdAt: number
  favoriteCharacterId?: string
  gamesPlayed: number
  wins: number
}

export interface PublicProfile {
  id: string
  login: string
  displayName: string
  createdAt: number
  favoriteCharacterId?: string
  gamesPlayed: number
  wins: number
}

function loadUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as UserAccount[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveUsers(users: UserAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function toPublic(u: UserAccount): PublicProfile {
  return {
    id: u.id,
    login: u.login,
    displayName: u.displayName,
    createdAt: u.createdAt,
    favoriteCharacterId: u.favoriteCharacterId,
    gamesPlayed: u.gamesPlayed,
    wins: u.wins,
  }
}

export function getSessionUserId(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function getCurrentUser(): PublicProfile | null {
  const id = getSessionUserId()
  if (!id) return null
  const u = loadUsers().find((x) => x.id === id)
  return u ? toPublic(u) : null
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export async function registerAccount(input: {
  login: string
  displayName: string
  password: string
}): Promise<{ ok: true; user: PublicProfile } | { ok: false; error: string }> {
  const login = input.login.trim().toLowerCase()
  const displayName = input.displayName.trim()
  const password = input.password

  if (login.length < 3) return { ok: false, error: 'Логин: минимум 3 символа' }
  if (!/^[a-z0-9_]+$/i.test(login)) {
    return { ok: false, error: 'Логин: только латиница, цифры и _' }
  }
  if (displayName.length < 2) return { ok: false, error: 'Имя: минимум 2 символа' }
  if (password.length < 4) return { ok: false, error: 'Пароль: минимум 4 символа' }

  const users = loadUsers()
  if (users.some((u) => u.login === login)) {
    return { ok: false, error: 'Такой логин уже занят на этом устройстве' }
  }

  const id = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  const passwordHash = await hashPassword(password, id)
  const user: UserAccount = {
    id,
    login,
    displayName,
    passwordHash,
    createdAt: Date.now(),
    gamesPlayed: 0,
    wins: 0,
  }
  users.push(user)
  saveUsers(users)
  localStorage.setItem(SESSION_KEY, id)
  return { ok: true, user: toPublic(user) }
}

export async function loginAccount(
  loginRaw: string,
  password: string,
): Promise<{ ok: true; user: PublicProfile } | { ok: false; error: string }> {
  const login = loginRaw.trim().toLowerCase()
  const users = loadUsers()
  const user = users.find((u) => u.login === login)
  if (!user) return { ok: false, error: 'Пользователь не найден' }
  const hash = await hashPassword(password, user.id)
  if (hash !== user.passwordHash) return { ok: false, error: 'Неверный пароль' }
  localStorage.setItem(SESSION_KEY, user.id)
  return { ok: true, user: toPublic(user) }
}

export function updateProfile(patch: {
  displayName?: string
  favoriteCharacterId?: string
}): PublicProfile | null {
  const id = getSessionUserId()
  if (!id) return null
  const users = loadUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx < 0) return null
  const u = { ...users[idx] }
  if (patch.displayName?.trim()) u.displayName = patch.displayName.trim()
  if (patch.favoriteCharacterId) u.favoriteCharacterId = patch.favoriteCharacterId
  users[idx] = u
  saveUsers(users)
  return toPublic(u)
}

export function recordGameResult(won: boolean) {
  const id = getSessionUserId()
  if (!id) return
  const users = loadUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx < 0) return
  users[idx] = {
    ...users[idx],
    gamesPlayed: users[idx].gamesPlayed + 1,
    wins: users[idx].wins + (won ? 1 : 0),
  }
  saveUsers(users)
}
