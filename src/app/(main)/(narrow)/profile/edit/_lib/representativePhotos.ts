import { preparePhoto, validatePhoto } from '@/shared/lib/preparePhoto'

export const MAX_REPRESENTATIVE_PHOTOS = 4
export type PhotoSlot = string | File | null

export function addRepresentativePhotos(slots: PhotoSlot[], files: File[], startIndex = 0) {
  const next = Array.from({ length: MAX_REPRESENTATIVE_PHOTOS }, (_, i) => slots[i] ?? null)
  if (files.length > next.filter((photo) => photo === null).length) {
    throw new Error(`대표사진은 최대 ${MAX_REPRESENTATIVE_PHOTOS}장까지 선택할 수 있어요.`)
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

// 한 칸만 비우고 나머지 칸 위치는 그대로 둔다
export function removeRepresentativePhoto(slots: PhotoSlot[], index: number) {
  return Array.from({ length: MAX_REPRESENTATIVE_PHOTOS }, (_, i) =>
    i === index ? null : (slots[i] ?? null),
  )
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
