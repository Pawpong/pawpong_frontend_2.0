import { MOBILE_APP } from '@/shared/config/mobileApp'
import { parseMobileStoreUrl } from '@/shared/lib/mobileApp'

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
    return /^(?:\/|\/(?:about|activity|adoption|ai-filter|bookmarks|chat|community|explore|faq|grade-policy|hall-of-fame|home|notices|notifications|profile|settings|terms-of-privacy|terms-of-service)(?:\/[A-Za-z0-9_-]+)*)$/.test(
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

export const parseStoreUrl = parseMobileStoreUrl

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
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#fef9ef"><title>${escapeHtml(title)} | 포퐁</title><meta name="description" content="${escapeHtml(description)}">${metadata}
<style>
*{box-sizing:border-box}html{min-height:100%;background:#fef9ef}body{margin:0;min-height:100vh;color:#3e3e3e;font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;line-height:1.55;background:radial-gradient(circle at 12% 12%,#ffe6b3 0,transparent 28%),radial-gradient(circle at 85% 88%,#ffffc7 0,transparent 24%),#fef9ef}a{color:inherit}a:focus-visible{outline:3px solid #ad651d;outline-offset:3px}.shell{width:min(100% - 32px,520px);margin:0 auto;padding:clamp(24px,5vh,52px) 0 32px}.brand{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 22px;padding:0 4px}.brand img{width:132px;height:48px;object-fit:contain;object-position:left center}.brand span{font-size:12px;font-weight:800;letter-spacing:.1em;color:#8a5117}.card{overflow:hidden;background:#fff;border:1px solid #f8d17d;border-radius:28px;box-shadow:0 12px 0 #fdf4df,0 22px 50px rgba(104,61,17,.1)}.hero{position:relative;display:grid;place-items:center;min-height:224px;padding:28px;background:#ffe6b3;isolation:isolate}.hero:before,.hero:after{content:"✦";position:absolute;color:#f6c65d;font-size:30px}.hero:before{top:25px;left:10%}.hero:after{right:11%;bottom:20px;font-size:22px}.hero img{position:relative;z-index:1;display:block;width:100%;max-width:210px;max-height:176px;object-fit:contain}.hero img.cover{max-width:min(100%,340px);max-height:220px;border-radius:18px}.copy{padding:30px clamp(22px,6vw,38px) 34px}.eyebrow{display:inline-flex;align-items:center;gap:7px;margin:0 0 10px;color:#ad651d;font-size:12px;font-weight:800;letter-spacing:.04em}.eyebrow:before{content:"";width:7px;height:7px;border-radius:50%;background:#f6c65d}h1{margin:0;font-size:clamp(25px,6vw,32px);line-height:1.35;letter-spacing:-.035em;overflow-wrap:anywhere}.description{margin:12px 0 0;color:#686868;font-size:15px;white-space:pre-wrap;overflow-wrap:anywhere}.actions{display:grid;gap:10px;margin-top:30px}.button{display:flex;align-items:center;justify-content:center;min-height:54px;padding:13px 18px;border:1px solid #d9d9d9;border-radius:16px;background:#fff;text-align:center;text-decoration:none;font-size:15px;font-weight:800;transition:transform .15s,background .15s,border-color .15s}.button:hover{transform:translateY(-2px);border-color:#f8d17d;background:#fef9ef}.button.primary{border-color:#fffe72;background:#fffe72;color:#3e3e3e;box-shadow:0 4px 0 #dbda5b}.button.primary:hover{background:#fffeaa}.stores{margin-top:28px;padding-top:23px;border-top:1px solid #eee}.stores-title{margin:0 0 12px;font-size:14px;font-weight:800}.store-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}.store-link{display:flex;align-items:center;justify-content:center;min-height:44px;border:1px solid #e7e7e7;border-radius:12px;text-decoration:none;font-size:13px;font-weight:700}.store-link:hover{background:#fef9ef;border-color:#f8d17d}.hint{margin:18px 0 0;color:#777;font-size:12px;text-align:center}.foot{margin:30px 0 0;text-align:center;font-size:12px;color:#8c7a67}.unavailable{padding:42px 30px}.unavailable h1{font-size:25px}.unavailable p{color:#686868;margin:12px 0 24px}@media(max-width:520px){.shell{width:min(100% - 24px,520px);padding-top:18px}.brand{margin-bottom:14px}.card{border-radius:22px}.hero{min-height:190px}.copy{padding:26px 22px 28px}}@media(prefers-reduced-motion:reduce){.button{transition:none}.button:hover{transform:none}}
.store-pending{margin:0;color:#777;font-size:13px}
</style></head><body><div class="shell"><header class="brand"><a href="/" aria-label="포퐁 홈"><img src="/images/logo/logo.svg" alt="포퐁"></a><span>PAWPONG LINK</span></header><main class="card">${content}</main><p class="foot">좋은 만남의 시작, 포퐁</p></div></body></html>`
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
    ? `intent://l/${link.slug}#Intent;scheme=pawpong;package=${MOBILE_APP.android.packageName};S.browser_fallback_url=${encodeURIComponent(stores.android ?? webUrl)};end`
    : `pawpong://l/${link.slug}`
  const description = link.description || '포퐁에서 자세한 내용을 확인해 보세요.'
  const image = link.imageUrl || `${origin}/images/logo/share-logo.png`
  // dev/로컬 링크는 운영 앱에서 열 수 없으므로 운영 원본의 공유 링크에만 앱 메타데이터를 붙인다.
  const appMetadata =
    origin === SITE_ORIGIN
      ? `<meta name="apple-itunes-app" content="app-id=${MOBILE_APP.ios.appId}, app-argument=${escapeHtml(canonical)}"><meta property="al:ios:app_store_id" content="${MOBILE_APP.ios.appId}"><meta property="al:ios:app_name" content="포퐁"><meta property="al:ios:url" content="${escapeHtml(canonical)}"><meta property="al:android:package" content="${MOBILE_APP.android.packageName}"><meta property="al:android:app_name" content="포퐁"><meta property="al:android:url" content="${escapeHtml(canonical)}"><meta property="al:web:url" content="${escapeHtml(webUrl)}"><meta property="al:web:should_fallback" content="true">`
      : ''
  const metadata = `<link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:type" content="website"><meta property="og:site_name" content="포퐁"><meta property="og:title" content="${escapeHtml(link.title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${escapeHtml(image)}"><meta name="twitter:card" content="summary_large_image">${appMetadata}`
  const storeLinks = [
    stores.ios &&
      `<a class="store-link" href="${escapeHtml(stores.ios)}" rel="noopener noreferrer">App Store에서 받기 ↗</a>`,
    stores.android &&
      `<a class="store-link" href="${escapeHtml(stores.android)}" rel="noopener noreferrer">Google Play에서 받기 ↗</a>`,
  ]
    .filter(Boolean)
    .join('')
  const heroImage =
    link.imageUrl ||
    (link.targetPath.startsWith('/ai-filter')
      ? '/images/category/dog-default-md.svg'
      : '/images/category/cta-paw.svg')
  const downloadSection = storeLinks
    ? `<section class="stores" aria-label="앱 다운로드"><p class="stores-title">포퐁 앱이 아직 없나요?</p><div class="store-links">${storeLinks}</div></section>`
    : '<section class="stores" aria-label="앱 다운로드"><p class="stores-title">포퐁 앱이 아직 없나요?</p><p class="store-pending">앱 다운로드를 준비 중이에요. 지금은 웹에서 먼저 만나보세요.</p></section>'
  return documentHtml(
    link.title,
    description,
    metadata,
    `<div class="hero"><img class="${link.imageUrl ? 'cover' : ''}" src="${escapeHtml(heroImage)}" alt=""${link.imageUrl ? ' referrerpolicy="no-referrer"' : ''}></div><div class="copy"><p class="eyebrow">포퐁에서 만나요</p><h1>${escapeHtml(link.title)}</h1><p class="description">${escapeHtml(description)}</p><div class="actions"><a id="open-pawpong-app" class="button primary" href="${escapeHtml(appUrl)}" data-ios-store="${escapeHtml(stores.ios ?? '')}" data-android-store="${escapeHtml(stores.android ?? '')}" data-web-url="${escapeHtml(webUrl)}">포퐁 앱에서 열기 ↗</a><a class="button" href="${escapeHtml(link.targetPath)}">웹으로 보기</a></div>${downloadSection}<p class="hint">${storeLinks ? '앱이 없으면 스토어로 연결돼요. ' : ''}웹에서도 바로 볼 수 있어요.</p></div><script src="/scripts/deep-link-open.js" defer></script>`,
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
    `<div class="unavailable"><h1>${title}</h1><p>${description}</p><a class="button" href="/">포퐁 홈으로</a></div>`,
  )
}
