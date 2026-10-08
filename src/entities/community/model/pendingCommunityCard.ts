import { createAuthSessionHandoff } from '@/shared/lib/createAuthSessionHandoff'

const pending = createAuthSessionHandoff<File>(5 * 60_000)

/** Explicit, one-time in-memory handoff to the signed-in author's new post. */
export function setPendingCommunityCard(file: File) {
  pending.clear()
  if (!file.size || file.type !== 'image/png') throw new Error('완성된 PNG 카드가 필요해요.')
  pending.set(file)
}

export function takePendingCommunityCard(source?: string): File | null {
  const card = pending.take()
  return source === 'memory-card' ? card : null
}
