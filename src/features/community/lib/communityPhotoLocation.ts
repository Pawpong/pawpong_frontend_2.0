import type { CommunityPhotoLocation } from '../model/community-photo-location.type'

const locations = new WeakMap<File, CommunityPhotoLocation>()
const takenTimes = new WeakMap<File, number>()
// 오래된 카메라 기본값(1970년대)이나 미래 시각은 촬영 시각으로 믿지 않는다.
const EARLIEST_TAKEN_AT = Date.UTC(1990, 0, 1)
const FUTURE_TOLERANCE = 24 * 60 * 60 * 1000

export function toCommunityPhotoLocation(value: unknown): CommunityPhotoLocation | undefined {
  if (!value || typeof value !== 'object') return
  const { latitude, longitude } = value as Record<string, unknown>
  if (
    typeof latitude !== 'number' ||
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90 ||
    typeof longitude !== 'number' ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180 ||
    (latitude === 0 && longitude === 0)
  )
    return
  return { latitude: Number(latitude.toFixed(4)), longitude: Number(longitude.toFixed(4)) }
}

const EXIF_DATE_TIME = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/

/**
 * EXIF 촬영 시각 문자열을 기기 시간대로 읽는다. 13월이나 99시처럼 넘치는 값을
 * Date가 다음 달로 넘겨 그럴듯한 시각을 만들지 않도록 각 자리를 되짚어 확인한다.
 */
export function toCommunityPhotoTakenAt(value: unknown, now = Date.now()): number | undefined {
  if (typeof value !== 'string') return
  const match = EXIF_DATE_TIME.exec(value.trim())
  if (!match) return
  const [year, month, day, hour, minute, second] = match.slice(1).map(Number)
  const date = new Date(year, month - 1, day, hour, minute, second)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute ||
    date.getSeconds() !== second
  )
    return
  const time = date.getTime()
  if (time < EARLIEST_TAKEN_AT || time > now + FUTURE_TOLERANCE) return
  return time
}

export async function readCommunityPhotoLocation(file: File) {
  try {
    const { gps } = await import('exifr')
    const value: unknown = await gps(file)
    return toCommunityPhotoLocation(value)
  } catch {
    return undefined
  }
}

export async function readCommunityPhotoTakenAt(file: File) {
  try {
    const { parse } = await import('exifr')
    // 원문 문자열을 받아 직접 검증한다. 자동 변환은 잘못된 날짜도 Date로 바꿔버린다.
    const tags: unknown = await parse(file, { pick: ['DateTimeOriginal'], reviveValues: false })
    return toCommunityPhotoTakenAt(
      (tags as { DateTimeOriginal?: unknown } | undefined)?.DateTimeOriginal,
    )
  } catch {
    return undefined
  }
}

export function rememberCommunityPhotoLocation(file: File, location?: CommunityPhotoLocation) {
  if (location) locations.set(file, location)
}

export function getCommunityPhotoLocation(file: File) {
  return locations.get(file)
}

export function rememberCommunityPhotoTakenAt(file: File, takenAt?: number) {
  if (takenAt !== undefined) takenTimes.set(file, takenAt)
}

export function getCommunityPhotoTakenAt(file: File) {
  return takenTimes.get(file)
}
