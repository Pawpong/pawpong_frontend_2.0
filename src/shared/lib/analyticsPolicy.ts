/** Public identifiers. GTM owns GA configuration; never load a second gtag.js in the app. */
export const GTM_CONTAINER_ID = 'GTM-52KZQGJJ'

const pages: Record<string, string> = {
  '/': 'landing',
  '/home': 'my_home',
  '/explore': 'explore',
  '/community': 'community',
  '/community/write': 'community_write',
  '/ai-filter': 'ai_filter',
  '/chat': 'chat',
  '/settings': 'settings',
  '/notifications': 'notifications',
  '/bookmarks': 'bookmarks',
  '/care-map': 'care_map',
  '/playground': 'playground',
  '/activity': 'activity',
  '/drafts': 'drafts',
  '/profile/edit': 'profile_edit',
  '/profile/verification': 'profile_verification',
  '/account/content-rights': 'content_rights',
  '/account/delete': 'account_delete',
  '/adoption/create': 'adoption_create',
  '/adoption/create/success': 'adoption_created',
  '/adoption/application-form': 'adoption_application_form',
  '/hall-of-fame': 'hall_of_fame',
  '/hall-of-fame/participate': 'hall_of_fame_participate',
  '/notices': 'notices',
  '/about': 'about',
  '/faq': 'faq',
  '/terms-of-privacy': 'privacy',
  '/terms-of-service': 'terms',
  '/login': 'login',
  '/login/review': 'review_login',
  '/signup': 'signup',
}

const dynamicPages: [RegExp, string, string][] = [
  [/^\/home\/[^/]+$/, '/home/:user', 'user_home'],
  [/^\/community\/post\/[^/]+$/, '/community/post/:post', 'community_post'],
  [/^\/community\/post\/[^/]+\/edit$/, '/community/post/:post/edit', 'community_edit'],
  [/^\/adoption\/[^/]+$/, '/adoption/:post', 'adoption_post'],
  [/^\/adoption\/[^/]+\/apply$/, '/adoption/:post/apply', 'adoption_apply'],
  [/^\/adoption\/[^/]+\/edit$/, '/adoption/:post/edit', 'adoption_edit'],
  [/^\/notices\/[^/]+$/, '/notices/:notice', 'notice'],
  [/^\/activity\/applications\/[^/]+$/, '/activity/applications/:application', 'application'],
  [
    /^\/activity\/applications\/[^/]+\/edit$/,
    '/activity/applications/:application/edit',
    'application_edit',
  ],
  [/^\/activity\/(?:received-reviews|reviews)\/[^/]+$/, '/activity/reviews/:review', 'review'],
  [/^\/signup\/(?:adopter|breeder)(?:\/[^/]+)?$/, '/signup/:type/:step', 'signup_step'],
]

/** Only route templates leave the device. Queries, hashes and user-provided titles never do. */
export function analyticsPage(pathname: string): { path: string; screen: string } | null {
  const path = pathname.split(/[?#]/, 1)[0].replace(/\/$/, '') || '/'
  if (pages[path]) return { path, screen: pages[path] }
  const dynamic = dynamicPages.find(([pattern]) => pattern.test(path))
  return dynamic ? { path: dynamic[1], screen: dynamic[2] } : null
}

export function analyticsEnabled(
  hostname: string,
  environment: string | undefined,
  debug: boolean,
): boolean {
  if (debug && ['localhost', '127.0.0.1', '10.0.2.2'].includes(hostname)) return true
  return environment === 'production' && ['pawpong.kr', 'www.pawpong.kr'].includes(hostname)
}

export function analyticsReferrer(referrer: string): string {
  try {
    const url = new URL(referrer)
    if (!['http:', 'https:'].includes(url.protocol)) return ''
    if (['pawpong.kr', 'www.pawpong.kr'].includes(url.hostname)) {
      const page = analyticsPage(url.pathname)
      return page ? `https://pawpong.kr${page.path}` : ''
    }
    return url.origin
  } catch {
    return ''
  }
}
