import { NextRequest, NextResponse } from 'next/server'
import { isSameOriginRequest } from '@/shared/lib/server/sameOrigin'
import { supportConversationSchema, takeSupportCreationSlot } from '@/features/inquiry/server'

export const maxDuration = 70

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache' }
const TOKEN_COOKIE = 'pawpongSupportConversation'
const UUID = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i

type Context = { params: Promise<{ segments?: string[] }> }

function failure(status: number, errorCode?: string) {
  return NextResponse.json(
    {
      success: false,
      message: 'AI 문의 요청을 완료하지 못했습니다.',
      ...(errorCode ? { errorCode } : {}),
    },
    { status, headers: NO_STORE },
  )
}

async function forward(request: NextRequest, context: Context) {
  if (!isSameOriginRequest(request)) return failure(403)
  const { segments = [] } = await context.params
  const [id, action] = segments
  const creating = request.method === 'POST' && segments.length === 0
  const reading = request.method === 'GET' && segments.length === 1
  const mutating =
    request.method === 'POST' && segments.length === 2 && ['turns', 'submit'].includes(action)
  if (!creating && !(id && UUID.test(id) && (reading || mutating))) return failure(404)

  const token = creating ? undefined : request.cookies.get(TOKEN_COOKIE)?.value
  if (!creating && !token) return failure(401)
  let body: string | undefined
  if (request.method === 'POST') {
    if (!request.headers.get('content-type')?.includes('application/json')) return failure(415)
    if (Number(request.headers.get('content-length')) > 16_384) return failure(413)
    body = await request.text()
    if (Buffer.byteLength(body, 'utf8') > 16_384) return failure(413)
    try {
      JSON.parse(body)
    } catch {
      return failure(400)
    }
  }

  const slot = creating
    ? takeSupportCreationSlot(request.cookies.get('pawpongSupportSession')?.value)
    : null
  if (slot && !slot.allowed) return failure(429)
  const withSession = (response: NextResponse) => {
    if (slot)
      response.cookies.set('pawpongSupportSession', slot.sessionId, {
        path: '/api/support',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60,
      })
    return response
  }

  try {
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080').replace(
      /\/+$/,
      '',
    )
    const upstream = await fetch(
      `${base}/api/v2/home/support/conversations${id ? `/${id}` : ''}${action ? `/${action}` : ''}`,
      {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'X-Support-Token': token } : {}),
        },
        body,
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'error',
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(60_000)]),
      },
    )
    const envelope = await upstream.json()
    if (!upstream.ok || !envelope?.success) {
      const rawError = typeof envelope?.error === 'string' ? envelope.error : ''
      const code =
        /^(CONVERSATION_BUSY|REVISION_CONFLICT|REQUEST_ID_CONFLICT|TURN_LIMIT|CONVERSATION_SUBMITTED|DRAFT_REQUIRED):/.exec(
          rawError,
        )?.[1]
      return withSession(
        failure(
          [400, 401, 403, 404, 409, 410, 429, 503].includes(upstream.status)
            ? upstream.status
            : 502,
          code,
        ),
      )
    }
    const accessToken = envelope?.data?.accessToken
    // 허용된 대화 필드만 반환해 capability와 내부 오류가 응답에 포함되지 않게 한다.
    const parsed = supportConversationSchema.safeParse(envelope.data)
    if (!parsed.success || (creating && typeof accessToken !== 'string'))
      return withSession(failure(502))
    const response = NextResponse.json({ success: true, data: parsed.data }, { headers: NO_STORE })
    if (creating && upstream.ok && envelope?.success) {
      response.cookies.set(TOKEN_COOKIE, accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        // 각 대화의 경로로 격리하므로 다른 탭에서 시작한 대화가 토큰을 덮어쓰지 않는다.
        path: `/api/support/conversations/${envelope.data.conversationId}`,
        maxAge: 60 * 60 * 24 * 7,
      })
    }
    return withSession(response)
  } catch {
    // 토큰·대화 원문·상위 서버 오류 내용을 로그에 남기지 않는다.
    return withSession(failure(502))
  }
}

export const GET = forward
export const POST = forward

/** 서버 대화를 삭제하지 않고, 새 대화로 바꾼 브라우저의 접근 쿠키만 폐기한다. */
export async function DELETE(request: NextRequest, context: Context) {
  if (!isSameOriginRequest(request)) return failure(403)
  const { segments = [] } = await context.params
  if (segments.length !== 1 || !UUID.test(segments[0])) return failure(404)
  const response = NextResponse.json({ success: true }, { headers: NO_STORE })
  response.cookies.set(TOKEN_COOKIE, '', {
    path: `/api/support/conversations/${segments[0]}`,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
  })
  return response
}
