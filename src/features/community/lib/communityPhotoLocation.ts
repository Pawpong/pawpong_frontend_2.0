import type { CommunityPhotoLocation } from '../model/community-photo-location.type'

const locations = new WeakMap<File, CommunityPhotoLocation>()

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

export async function readCommunityPhotoLocation(file: File) {
  try {
    const { gps } = await import('exifr')
    const value: unknown = await gps(file)
    return toCommunityPhotoLocation(value)
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
