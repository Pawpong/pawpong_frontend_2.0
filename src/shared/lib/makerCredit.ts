import { PAWPONG_MAKERS } from '@/shared/config/makers'
import { SITE_NAME, SITE_URL } from '@/shared/config/site'

export const MAKER_AUTHORS = PAWPONG_MAKERS.map(({ name, github, site }) => ({
  name: `${name} (${github})`,
  url: site ?? `https://github.com/${github}`,
}))

export const MAKER_PEOPLE = PAWPONG_MAKERS.map(({ name, github, site }) => ({
  '@type': 'Person',
  '@id': `${SITE_URL}/#maker-${github}`,
  name,
  alternateName: github,
  url: site ?? `https://github.com/${github}`,
  sameAs: `https://github.com/${github}`,
}))

export const WEBSITE_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'ko-KR',
  creator: MAKER_PEOPLE,
}
