import {
  getLandingOrigin,
  isValidSlug,
  parseDeepLink,
  parseStoreUrl,
  renderLanding,
  renderUnavailable,
} from './_lib/landing'

export const dynamic = 'force-dynamic'

function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy':
        "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' https:; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
    },
  })
}

/** 공유 크롤러와 JavaScript가 없는 브라우저에도 완성된 안내 HTML을 반환한다. */
export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await context.params
  if (!isValidSlug(slug)) return htmlResponse(renderUnavailable(false), 404)
  const backendUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080').replace(
    /\/+$/,
    '',
  )
  const fetchData = async (path: string) => {
    const response = await fetch(`${backendUrl}${path}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2500),
    })
    if (!response.ok) return { status: response.status, data: undefined }
    const body = await response.json()
    return {
      status: body.success === true ? 200 : 502,
      data: body.success === true ? body.data : undefined,
    }
  }
  try {
    const [result, ios, android] = await Promise.all([
      fetchData(`/api/v2/deep-links/${slug}`),
      fetchData('/api/v2/app-version/check?platform=ios&currentVersion=0.0.0').catch(
        () => undefined,
      ),
      fetchData('/api/v2/app-version/check?platform=android&currentVersion=0.0.0').catch(
        () => undefined,
      ),
    ])
    if (result.status === 404) return htmlResponse(renderUnavailable(false), 404)
    const link = parseDeepLink(result.data, slug)
    if (!link) {
      console.warn('[deep-link] Public resolver returned an invalid response', {
        status: result.status,
      })
      return htmlResponse(renderUnavailable(true), 503)
    }
    return htmlResponse(
      renderLanding(
        link,
        request.headers.get('user-agent') ?? '',
        {
          ios: parseStoreUrl(ios?.data?.storeUrl, 'ios'),
          android: parseStoreUrl(android?.data?.storeUrl, 'android'),
        },
        getLandingOrigin(
          request.url,
          process.env.NODE_ENV === 'development',
          request.headers.get('host') ?? undefined,
        ),
      ),
    )
  } catch (error) {
    // 운영 장애 분석에는 오류 종류만 남기고 공유 내용/토큰/응답 본문은 기록하지 않는다.
    const cause = error instanceof Error ? error.cause : undefined
    console.warn('[deep-link] Public resolver request failed', {
      name: error instanceof Error ? error.name : 'UnknownError',
      code: cause && typeof cause === 'object' && 'code' in cause ? cause.code : undefined,
    })
    return htmlResponse(renderUnavailable(true), 503)
  }
}
