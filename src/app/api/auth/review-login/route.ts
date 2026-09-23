import { NextRequest, NextResponse } from 'next/server'
import {
  reviewLoginErrorMessage,
  reviewLoginRequestSchema,
  reviewLoginResponseSchema,
} from '@/shared/lib/reviewLogin'

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache' }
const MAX_BODY_BYTES = 4096

function failure(status: number) {
  return NextResponse.json(
    { success: false, message: reviewLoginErrorMessage(status) },
    { status, headers: NO_STORE },
  )
}

async function readCredentials(request: NextRequest): Promise<unknown> {
  const reader = request.body?.getReader()
  if (!reader) return null
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_BODY_BYTES) {
        await reader.cancel()
        return null
      }
      chunks.push(value)
    }
    const body = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) {
      body.set(chunk, offset)
      offset += chunk.byteLength
    }
    return JSON.parse(new TextDecoder().decode(body))
  } finally {
    reader.releaseLock()
  }
}

/** 심사 계정 인증만 중계한다. 쿠키 발급은 기존 saveAuthTokens 흐름을 사용한다. */
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (
    (origin !== null && origin !== request.nextUrl.origin) ||
    request.headers.get('sec-fetch-site') === 'cross-site'
  ) {
    return failure(403)
  }
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    return failure(400)
  }

  let credentials
  try {
    credentials = reviewLoginRequestSchema.safeParse(await readCredentials(request))
  } catch {
    return failure(400)
  }
  if (!credentials.success) return failure(400)

  try {
    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080').replace(
      /\/+$/,
      '',
    )
    const response = await fetch(`${baseUrl}/api/auth/review-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials.data),
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(10_000)]),
    })
    if (!response.ok) {
      return failure([400, 401, 429, 503].includes(response.status) ? response.status : 502)
    }
    const parsed = reviewLoginResponseSchema.safeParse(await response.json())
    if (!parsed.success) return failure(502)
    // Zod가 정의한 필드만 반환하므로 서버 내부 정보나 추가 자격증명은 노출하지 않는다.
    return NextResponse.json(parsed.data, { headers: NO_STORE })
  } catch {
    // fetch 오류에는 요청 본문이 포함될 수 있으므로 기록하거나 그대로 응답하지 않는다.
    return failure(503)
  }
}
