import { preparePhoto, validatePhoto } from '@/shared/lib/preparePhoto'

export const MAX_REPRESENTATIVE_PHOTOS = 3
export type PhotoSlot = string | File | null

export function addRepresentativePhotos(slots: PhotoSlot[], files: File[], startIndex = 0) {
  const next = Array.from({ length: MAX_REPRESENTATIVE_PHOTOS }, (_, i) => slots[i] ?? null)
  if (files.length > next.filter((photo) => photo === null).length) {
    throw new Error('대표사진은 최대 3장까지 선택할 수 있어요.')
  }
  for (const file of files) validatePhoto(file)
  let fileIndex = 0
  for (let offset = 0; offset < MAX_REPRESENTATIVE_PHOTOS && fileIndex < files.length; offset++) {
    const index = (startIndex + offset) % MAX_REPRESENTATIVE_PHOTOS
    if (next[index] === null) {
      next[index] = files[fileIndex++]
    }
  }
  return next
}

export async function resolveRepresentativePhotos(
  slots: PhotoSlot[],
  upload: (file: File) => Promise<string>,
): Promise<string[]> {
  return Promise.all(
    slots
      .filter((photo): photo is string | File => photo !== null)
      .map((photo) =>
        typeof photo === 'string'
          ? photo
          : preparePhoto(photo).then((prepared) => upload(prepared)),
      ),
  )
}
