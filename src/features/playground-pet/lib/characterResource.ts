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
      if (img.naturalWidth === 576 && img.naturalHeight === 96) resolve()
      else reject(new Error('캐릭터 프레임 크기가 올바르지 않아요. 다시 준비해 주세요.'))
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
