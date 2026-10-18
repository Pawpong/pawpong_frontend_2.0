import { randomUUID } from 'node:crypto'

const windows = new Map<string, { count: number; expiresAt: number }>()
const WINDOW_MS = 60_000

/** 인스턴스별 보조 제한. 인스턴스 간의 강제 상한은 백엔드 global limiter가 담당한다. */
export function takeSupportCreationSlot(sessionId?: string, now = Date.now()) {
  for (const [id, entry] of windows) if (entry.expiresAt <= now) windows.delete(id)
  const id = sessionId && windows.has(sessionId) ? sessionId : randomUUID()
  const window = windows.get(id) ?? { count: 0, expiresAt: now + WINDOW_MS }
  if (window.count >= 5 || windows.size >= 10_000) return { allowed: false, sessionId: id }
  window.count += 1
  windows.set(id, window)
  return { allowed: true, sessionId: id }
}
