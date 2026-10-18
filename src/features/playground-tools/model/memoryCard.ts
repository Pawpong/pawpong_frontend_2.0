export const MEMORY_THEMES = [
  {
    id: 'butter',
    name: '버터 산책',
    background: '#FFF3B8',
    paper: '#FFFCED',
    accent: '#AE641E',
    soft: '#EDD999',
  },
  {
    id: 'mint',
    name: '민트 정원',
    background: '#E1F1DD',
    paper: '#FCFFF4',
    accent: '#55784D',
    soft: '#B2CEA3',
  },
  {
    id: 'lavender',
    name: '라벤더 소풍',
    background: '#EBE3FA',
    paper: '#FFFCFF',
    accent: '#785990',
    soft: '#CBBBDB',
  },
] as const
export type MemoryTheme = (typeof MEMORY_THEMES)[number]['id']
export type MemoryCardInput = {
  name: string
  message: string
  date: string
  theme: MemoryTheme
  zoom: number
  offsetX: number
  offsetY: number
}
export const MEMORY_CARD_SIZE = { width: 1080, height: 1350 }
export function todayLocalDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
export function validCardDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day))
  return (
    year >= 1900 &&
    year <= 2200 &&
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  )
}
export function formatCardDate(date: string) {
  return validCardDate(date) ? date.replaceAll('-', '.') : ''
}
export function normalizeCardText(value: string, limit: number) {
  return [
    ...value
      .normalize('NFC')
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  ]
    .slice(0, limit)
    .join('')
}
export function photoCrop(
  width: number,
  height: number,
  zoom: number,
  offsetX: number,
  offsetY: number,
) {
  if (![width, height, zoom, offsetX, offsetY].every(Number.isFinite) || width <= 0 || height <= 0)
    throw new Error('사진 크기를 확인할 수 없습니다.')
  const size = Math.min(width, height) / Math.max(1, Math.min(2.5, zoom))
  const clamp = (n: number) => Math.max(0, Math.min(1, n))
  return {
    x: (width - size) * clamp(offsetX / 100),
    y: (height - size) * clamp(offsetY / 100),
    size,
  }
}
export function memoryFileName(date: string) {
  return `pawpong-memory-${validCardDate(date) ? date : 'today'}.png`
}
export function memoryCardExportMode(
  inApp: boolean,
  canShareFiles: boolean,
  shareRequested: boolean,
): 'share' | 'download' | 'unsupported' {
  if (canShareFiles && (inApp || shareRequested)) return 'share'
  return inApp ? 'unsupported' : 'download'
}
