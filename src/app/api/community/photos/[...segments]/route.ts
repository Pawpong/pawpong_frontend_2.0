import { NextRequest, NextResponse } from 'next/server'
import {
  parseCommunityPhotoSegments,
  readCommunityPhotoBody,
  COMMUNITY_PHOTO_RESPONSE_HEADERS,
  COMMUNITY_PHOTO_TIMEOUT_MS,
} from '@/entities/community/server'
import { isDevelopmentCommunityHost, isSameOriginRequest } from '@/shared/lib/server'

export const dynamic = 'force-dynamic'

const fail = (status: number) =>
  new NextResponse(null, { status, headers: COMMUNITY_PHOTO_RESPONSE_HEADERS })

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ segments: string[] }> },
) {
  if (!isDevelopmentCommunityHost(request.headers.get('host') ?? request.nextUrl.host))
    return fail(404)
  if (!isSameOriginRequest(request)) return fail(403)
  const photo = parseCommunityPhotoSegments((await context.params).segments)
  if (!photo) return fail(404)
  const token = request.cookies.get('accessToken')?.value
  if (photo.ownerOnly && !token) return fail(401)

  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(COMMUNITY_PHOTO_TIMEOUT_MS)])
  try {
    const headers: Record<string, string> = { Accept: 'image/jpeg, image/png, image/webp' }
    if (token) headers.Authorization = `Bearer ${token}`
    const userAgent = request.headers.get('user-agent')
    if (userAgent) headers['User-Agent'] = userAgent
    const response = await fetch(`https://dev-api.pawpong.kr${photo.backendPath}`, {
      headers,
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
      signal,
    })
    if (response.status !== 200) {
      await response.body?.cancel()
      return fail([401, 403, 404, 429].includes(response.status) ? response.status : 502)
    }
    const { bytes, contentType } = await readCommunityPhotoBody(response, signal)
    signal.throwIfAborted()
    return new NextResponse(bytes, {
      headers: {
        ...COMMUNITY_PHOTO_RESPONSE_HEADERS,
        'Content-Type': contentType,
        'Content-Length': String(bytes.byteLength),
      },
    })
  } catch {
    return fail(502)
  }
}
