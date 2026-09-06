/** Photo-only input. RAW, SVG and videos are excluded. */
export const PHOTO_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.heif'
export const MAX_PHOTO_BYTES = 100 * 1024 * 1024

export function validatePhoto(file: File) {
  if (!file.size) throw new Error('비어 있는 사진입니다. 다른 사진을 선택해 주세요.')
  if (file.size > MAX_PHOTO_BYTES) throw new Error('사진은 100MB 이하로 선택해 주세요.')
  const type = file.type.toLowerCase()
  const knownType =
    /^image\/(jpeg|jpg|png|webp|gif|avif|heic|heif|heic-sequence|heif-sequence)$/.test(type)
  const knownExtension = /\.(jpe?g|png|webp|gif|avif|heic|heif)$/i.test(file.name)
  if (!knownType && !((!type || type === 'application/octet-stream') && knownExtension)) {
    throw new Error('JPG, PNG, WEBP, GIF, AVIF, HEIC 또는 HEIF 사진을 선택해 주세요.')
  }
}

async function decodePhoto(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Canvas applies EXIF orientation and strips metadata. Load the HEIC worker only
 * when native decoding fails. GIF/Live Photo uploads use a still frame. */
export async function preparePhoto(file: File): Promise<File> {
  validatePhoto(file)
  let image: HTMLImageElement
  try {
    image = await decodePhoto(file)
  } catch {
    if (!/\.(heic|heif)$/i.test(file.name) && !/^image\/hei[cf]/i.test(file.type)) {
      throw new Error('사진을 읽을 수 없습니다. 파일이 손상되었거나 지원하지 않는 형식입니다.')
    }
    try {
      const { heicTo } = await import('heic-to/csp')
      image = await decodePhoto(await heicTo({ blob: file, type: 'image/jpeg', quality: 0.92 }))
    } catch {
      throw new Error('HEIC 사진을 변환하지 못했습니다. JPG로 저장한 뒤 다시 선택해 주세요.')
    }
  }
  const ratio = Math.min(1, 2560 / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio))
  try {
    const context = canvas.getContext('2d')
    if (!context) throw new Error('사진을 처리할 수 없습니다. 브라우저를 새로고침해 주세요.')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result
            ? resolve(result)
            : reject(new Error('사진 변환에 실패했습니다. 다른 사진을 선택해 주세요.')),
        'image/jpeg',
        0.88,
      )
    })
    if (blob.size > 5 * 1024 * 1024)
      throw new Error('사진 용량을 충분히 줄이지 못했습니다. 더 작은 사진을 선택해 주세요.')
    return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'photo'}.jpg`, {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    })
  } finally {
    canvas.width = 0
    canvas.height = 0
    image.src = ''
  }
}
