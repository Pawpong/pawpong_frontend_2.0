/** One owner-scoped Blob URL, with cancellation and explicit dimension validation. */
export class PetCharacterResource {
  private request: AbortController | null = null
  private url: string | null = null
  private version = 0

  constructor(
    private readonly urls: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'> = URL,
  ) {}

  async load(
    fetchBlob: (signal: AbortSignal) => Promise<Blob>,
    validate: (url: string, signal: AbortSignal) => Promise<void>,
  ): Promise<string | null> {
    this.dispose()
    const version = this.version
    const request = new AbortController()
    this.request = request
    const blob = await fetchBlob(request.signal)
    if (request.signal.aborted || version !== this.version) return null
    const url = this.urls.createObjectURL(blob)
    try {
      await validate(url, request.signal)
      if (request.signal.aborted || version !== this.version) {
        this.urls.revokeObjectURL(url)
        return null
      }
      this.url = url
      return url
    } catch (error) {
      this.urls.revokeObjectURL(url)
      throw error
    }
  }

  dispose() {
    this.version++
    this.request?.abort()
    this.request = null
    if (this.url) this.urls.revokeObjectURL(this.url)
    this.url = null
  }
}

/** Bitmap checks complement the server's full-body/identity certification; they cannot infer anatomy. */
export function validatePetSheetPixels(data: Uint8ClampedArray | Uint8Array): void {
  const width = 576
  if (data.length !== width * 96 * 4) throw new Error('캐릭터 프레임 크기가 올바르지 않아요.')
  const colors = new Set<number>()
  const visible = Array<number>(6).fill(0)
  for (let y = 0; y < 96; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const alpha = data[i + 3]
      if (alpha !== 0 && alpha !== 255) throw new Error('투명한 도트 캐릭터가 필요해요.')
      if (alpha) {
        const fx = x % 96
        if (fx < 3 || fx >= 93 || y < 3 || y >= 84)
          throw new Error('잘리지 않은 전신 캐릭터가 필요해요.')
        colors.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2])
        visible[Math.floor(x / 96)]++
      }
      const origin = ((y - (y % 2)) * width + x - (x % 2)) * 4
      for (let channel = 0; channel < 4; channel++)
        if (data[i + channel] !== data[origin + channel])
          throw new Error('선명한 도트 격자가 필요해요.')
    }
  }
  if (colors.size > 48 || visible.some((count) => count < 36))
    throw new Error('캐릭터 프레임을 확인해 주세요.')
}

export function validatePetSheet(url: string, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const cleanup = () => {
      img.onload = null
      img.onerror = null
      signal.removeEventListener('abort', abort)
    }
    const abort = () => {
      cleanup()
      img.src = ''
      reject(new DOMException('Aborted', 'AbortError'))
    }
    img.onload = () => {
      cleanup()
      try {
        if (img.naturalWidth !== 576 || img.naturalHeight !== 96)
          throw new Error('캐릭터 프레임 크기가 올바르지 않아요.')
        const canvas = document.createElement('canvas')
        canvas.width = 576
        canvas.height = 96
        const context = canvas.getContext('2d', { willReadFrequently: true })
        if (!context) throw new Error('캐릭터 그림을 확인하지 못했어요.')
        context.drawImage(img, 0, 0)
        validatePetSheetPixels(context.getImageData(0, 0, 576, 96).data)
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = () => {
      cleanup()
      reject(new Error('캐릭터 그림을 읽지 못했어요.'))
    }
    signal.addEventListener('abort', abort, { once: true })
    if (signal.aborted) abort()
    else img.src = url
  })
}
