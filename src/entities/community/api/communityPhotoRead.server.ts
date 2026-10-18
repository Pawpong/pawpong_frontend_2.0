export const COMMUNITY_PHOTO_MAX_BYTES = 10 * 1024 * 1024
export const COMMUNITY_PHOTO_TIMEOUT_MS = 12_000
export const COMMUNITY_PHOTO_RESPONSE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'Cross-Origin-Resource-Policy': 'same-origin',
  Vary: 'Cookie',
}

export async function readCommunityPhotoBody(response: Response, signal: AbortSignal) {
  const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase()
  const length = response.headers.get('content-length')
  const expected = length === null ? undefined : Number(length)
  const validLength =
    expected === undefined ||
    (Number.isSafeInteger(expected) && expected > 0 && expected <= COMMUNITY_PHOTO_MAX_BYTES)
  if (
    !['image/jpeg', 'image/png', 'image/webp'].includes(contentType ?? '') ||
    !validLength ||
    !response.body
  ) {
    await response.body?.cancel()
    throw new Error('사진 응답 형식이 올바르지 않습니다.')
  }

  const reader = response.body.getReader()
  const cancel = () => {
    void reader.cancel().catch(() => undefined)
  }
  signal.addEventListener('abort', cancel, { once: true })
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      signal.throwIfAborted()
      const { done, value } = await reader.read()
      signal.throwIfAborted()
      if (done) break
      size += value.byteLength
      if (size > COMMUNITY_PHOTO_MAX_BYTES) throw new Error('사진 크기를 초과했습니다.')
      chunks.push(value)
    }
    if (!size || (expected !== undefined && expected !== size))
      throw new Error('사진이 완전히 수신되지 않았습니다.')
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.byteLength
    }
    return { bytes, contentType: contentType! }
  } finally {
    signal.removeEventListener('abort', cancel)
    await reader.cancel().catch(() => undefined)
    reader.releaseLock()
  }
}
