export const PET_ROOM_TABS = [
  { id: 'room', label: '내 방' },
  { id: 'decorate', label: '꾸미기' },
  { id: 'shop', label: '상점' },
  { id: 'games', label: '미니게임' },
  { id: 'records', label: '기록' },
] as const

export type PetTab = (typeof PET_ROOM_TABS)[number]['id']

export function petTabFromSearch(value: string | null | undefined): PetTab {
  return PET_ROOM_TABS.find((entry) => entry.id === value)?.id ?? 'room'
}

export function normalizePetSourceJobId(value: string | null | undefined): string | undefined {
  return value && /^[a-f\d]{24}$/i.test(value) ? value.toLowerCase() : undefined
}

export function petPageHref(options: { tab?: PetTab; sourceJobId?: string } = {}): string {
  const query = new URLSearchParams()
  const source = normalizePetSourceJobId(options.sourceJobId)
  if (source) query.set('sourceJobId', source)
  const tab = petTabFromSearch(options.tab)
  if (tab !== 'room') query.set('tab', tab)
  return `/playground/pet${query.size ? `?${query}` : ''}`
}
