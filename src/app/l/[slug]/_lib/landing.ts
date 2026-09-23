const SITE_ORIGIN = 'https://pawpong.kr'
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** 알려진 서비스 원본과 로컬 개발 원본만 공유 주소에 사용한다. */
export function getLandingOrigin(requestUrl: string, development: boolean, host?: string): string {
  try {
    const url = new URL(requestUrl)
    if (host && /^[a-z0-9.-]+(?::[0-9]+)?$/i.test(host)) url.host = host
    if (
      url.protocol === 'https:' &&
      ['pawpong.kr', 'www.pawpong.kr', 'dev.pawpong.kr'].includes(url.hostname) &&
      !url.port
    )
      return url.origin
    if (
      development &&
      url.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '10.0.2.2'].includes(url.hostname)
    )
      return url.origin
  } catch {
    /* 알 수 없는 Host는 공식 원본으로 정규화한다. */
  }
  return SITE_ORIGIN
}

export interface ManagedDeepLink {
  slug: string
  title: string
  description: string
  targetPath: string
  imageUrl: string
}

/** 서버 응답도 다시 검증해 외부 이동, 재귀 링크와 HTML 주입을 차단한다. */
export function isSafeTargetPath(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.length > 500
  )
    return false
  try {
    let decoded = value
    for (let depth = 0; depth < 4 && decoded.includes('%'); depth++)
      decoded = decodeURIComponent(decoded)
    if (
      decoded.includes('%') ||
      /[\\\u0000-\u0020\u007f<>"'`:]/.test(decoded) ||
      decoded.includes('//')
    )
      return false
    // 백엔드 deep-link-policy의 공개 앱 경로 목록과 맞춘다.
    return /^(?:\/|\/(?:about|activity|adoption|bookmarks|chat|community|explore|faq|grade-policy|hall-of-fame|home|notices|notifications|profile|settings|terms-of-privacy|terms-of-service)(?:\/[A-Za-z0-9_-]+)*)$/.test(
      decoded.split(/[?#]/, 1)[0],
    )
  } catch {
    return false
  }
}

export function isValidSlug(slug: string): boolean {
  return slug.length <= 80 && SLUG_PATTERN.test(slug)
}

function httpsUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined
  } catch {
    return undefined
  }
}

export function parseDeepLink(value: unknown, slug: string): ManagedDeepLink | undefined {
  if (!value || typeof value !== 'object') return undefined
  const link = value as Record<string, unknown>
  if (
    link.slug !== slug ||
    typeof link.title !== 'string' ||
    !link.title.trim() ||
    !isSafeTargetPath(link.targetPath)
  )
    return undefined
  return {
    slug,
    title: link.title.slice(0, 200),
    description: typeof link.description === 'string' ? link.description.slice(0, 1000) : '',
    targetPath: link.targetPath,
    imageUrl: httpsUrl(link.imageUrl) ?? '',
  }
}

/** 다운로드 주소는 어드민 앱 버전 설정에서만 가져온다. */
export function parseStoreUrl(value: unknown, platform: 'ios' | 'android'): string | undefined {
  const safeUrl = httpsUrl(value)
  if (!safeUrl) return undefined
  const url = new URL(safeUrl)
  if (platform === 'ios') {
    return url.hostname === 'apps.apple.com' && /\/id\d+(?:\/|$)/.test(url.pathname)
      ? safeUrl
      : undefined
  }
  return url.hostname === 'play.google.com' &&
    url.pathname === '/store/apps/details' &&
    url.searchParams.get('id') === 'kr.pawpong.app'
    ? safeUrl
    : undefined
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
  )
}

function documentHtml(
  title: string,
  description: string,
  metadata: string,
  content: string,
): string {
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f5eadf"><title>${escapeHtml(title)} | 포퐁</title><meta name="description" content="${escapeHtml(description)}">${metadata}
<style>
*{box-sizing:border-box}body{margin:0;background:#faf7f3;color:#231406;font-family:system-ui,-apple-system,sans-serif;line-height:1.6}main{max-width:480px;margin:clamp(24px,8vh,96px) auto;padding:32px 24px;background:white;border:1px solid #eddbca;border-radius:24px}header{display:flex;align-items:center;gap:10px;margin-bottom:32px}header img{width:94px;height:40px;object-fit:contain}header span{font-size:13px;color:#776859}.cover{width:100%;max-height:280px;object-fit:cover;border-radius:16px;margin-bottom:16px}h1{font-size:26px;line-height:1.4;overflow-wrap:anywhere}p{color:#776859;white-space:pre-wrap;overflow-wrap:anywhere}.actions{display:grid;gap:12px;margin-top:28px}a{color:#8a5117}a.button{display:block;border:1px solid #ddbe9f;border-radius:12px;text-decoration:none;text-align:center;padding:14px 16px;font-weight:650}a.primary{background:#ad651d;border-color:#ad651d;color:white}a:focus-visible{outline:3px solid #ad651d;outline-offset:4px}.stores{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-top:20px;font-size:14px}.hint{font-size:13px;text-align:center;margin-top:20px}@media(max-width:520px){main{margin:16px;border-radius:20px}}
</style></head><body><main><header><img src="/images/logo/logo.svg" alt="포퐁"><span>새로운 가족을 만나는 곳</span></header>${content}</main></body></html>`
}

export function renderLanding(
  link: ManagedDeepLink,
  userAgent: string,
  stores: { ios?: string; android?: string },
  origin = SITE_ORIGIN,
): string {
  const canonical = `${origin}/l/${link.slug}`
  const webUrl = new URL(link.targetPath, origin).href
  // Android Chrome은 사용자가 누른 intent 링크의 fallback을 앱 미설치 시 연다.
  const appUrl = /android/i.test(userAgent)
    ? `intent://l/${link.slug}#Intent;scheme=pawpong;package=kr.pawpong.app;S.browser_fallback_url=${encodeURIComponent(stores.android ?? webUrl)};end`
    : `pawpong://l/${link.slug}`
  const description = link.description || '포퐁에서 자세한 내용을 확인해 보세요.'
  const image = link.imageUrl || `${origin}/images/logo/share-logo.png`
  const metadata = `<link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:type" content="website"><meta property="og:site_name" content="포퐁"><meta property="og:title" content="${escapeHtml(link.title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${escapeHtml(image)}"><meta name="twitter:card" content="summary_large_image">`
  const storeLinks = [
    stores.ios &&
      `<a href="${escapeHtml(stores.ios)}" rel="noopener noreferrer">App Store에서 받기</a>`,
    stores.android &&
      `<a href="${escapeHtml(stores.android)}" rel="noopener noreferrer">Google Play에서 받기</a>`,
  ]
    .filter(Boolean)
    .join('')
  return documentHtml(
    link.title,
    description,
    metadata,
    `${link.imageUrl ? `<img class="cover" src="${escapeHtml(link.imageUrl)}" alt="" referrerpolicy="no-referrer">` : ''}<h1>${escapeHtml(link.title)}</h1><p>${escapeHtml(description)}</p><div class="actions"><a class="button primary" href="${escapeHtml(appUrl)}">포퐁 앱에서 열기</a><a class="button" href="${escapeHtml(link.targetPath)}">웹에서 계속하기</a></div>${storeLinks ? `<nav class="stores" aria-label="앱 다운로드">${storeLinks}</nav>` : ''}<p class="hint">앱이 열리지 않으면 웹에서 계속 이용할 수 있어요.</p>`,
  )
}

export function renderUnavailable(unavailable: boolean): string {
  const title = unavailable ? '잠시 연결할 수 없어요' : '사용할 수 없는 링크예요'
  const description = unavailable
    ? '잠시 후 다시 시도해 주세요.'
    : '링크가 만료되었거나 더 이상 제공되지 않아요.'
  return documentHtml(
    title,
    description,
    '<meta name="robots" content="noindex">',
    `<h1>${title}</h1><p>${description}</p><a class="button" href="/">포퐁 홈으로</a>`,
  )
}
