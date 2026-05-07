import { getStore } from '@netlify/blobs'
import { pbkdf2Sync, randomBytes } from 'crypto'

export const usersStore = () => getStore({ name: 'showtime-users', consistency: 'strong' })
export const sessionsStore = () => getStore({ name: 'showtime-sessions', consistency: 'strong' })
export const showsStore = () => getStore({ name: 'showtime-shows', consistency: 'strong' })
export const attendanceStore = () => getStore({ name: 'showtime-attendance', consistency: 'strong' })

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex')
  return { hash, salt }
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const testHash = pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex')
  return testHash === hash
}

export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

export function generateId(): string {
  return randomBytes(12).toString('hex')
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function getSessionUser(
  request: Request
): Promise<{ userId: string; email: string; name: string; verified: boolean } | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const sessions = sessionsStore()
  const session = (await sessions.get(`session:${token}`, { type: 'json' })) as any
  if (!session) return null
  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
    verified: session.verified,
  }
}
