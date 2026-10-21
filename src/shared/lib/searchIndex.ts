export function searchIndexEnabled(environment?: string, deployment?: string) {
  // Previews can inherit production env variables; Vercel's deployment type takes precedence.
  return environment === 'production' && (!deployment || deployment === 'production')
}

export function publicIndexPage(
  value: unknown,
): { ids: string[]; nextCursor: string | null } | null {
  if (!value || typeof value !== 'object') return null
  const page = value as { items?: unknown; nextCursor?: unknown }
  if (!Array.isArray(page.items) || page.items.length > 500) return null
  if (
    page.nextCursor !== null &&
    (typeof page.nextCursor !== 'string' || !/^[a-f\d]{24}$/.test(page.nextCursor))
  )
    return null
  const ids: string[] = []
  for (const item of page.items) {
    if (!item || typeof item !== 'object') return null
    const id = (item as { postId?: unknown }).postId
    if (typeof id !== 'string' || !/^[a-f\d]{24}$/.test(id)) return null
    ids.push(id)
  }
  return { ids, nextCursor: page.nextCursor }
}

/** Bounded recent index (5,000 scanned rows). Empty filtered pages still advance. */
export async function collectPublicPostIds(
  fetchPage: (before?: string) => Promise<unknown>,
): Promise<string[]> {
  const ids = new Set<string>()
  const cursors = new Set<string>()
  let before: string | undefined
  for (let pageNumber = 0; pageNumber < 10; pageNumber++) {
    const page = publicIndexPage(await fetchPage(before))
    if (!page) throw new Error('Invalid public index response')
    page.ids.forEach((id) => ids.add(id))
    if (!page.nextCursor) break
    if (cursors.has(page.nextCursor) || (before && page.nextCursor >= before))
      throw new Error('Non-advancing public index cursor')
    cursors.add(page.nextCursor)
    before = page.nextCursor
  }
  return [...ids]
}
