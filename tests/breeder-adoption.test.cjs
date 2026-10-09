const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createElement } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { loadTypescript } = require('./helpers/load-typescript.cjs')

// 입양 신청·입양목록은 입양자 전용 API 라 브리더는 403 을 받는다 — 화면이 미리 내리는지 확인한다.
const bookmarks = (userRole, initialTab) => {
  const { BookmarksContent } = loadTypescript('src/app/(main)/bookmarks/_ui/BookmarksContent.tsx', {
    '@/shared/ui': {
      TabBar: ({ items, value, children }) =>
        createElement(
          'nav',
          { 'data-value': value },
          items.map((item) => item.label).join(','),
          children,
        ),
      TabsContent: () => null,
    },
    '@/features/auth': { useAuthStatus: () => ({ userRole }) },
    './constants': loadTypescript('src/app/(main)/bookmarks/_ui/constants.ts'),
    './FavoritesTab': { FavoritesTab: () => null },
    './FavoriteBreedersContent': { FavoriteBreedersContent: () => null },
    './AdoptionListTab': { AdoptionListTab: () => null },
  })
  return renderToStaticMarkup(createElement(BookmarksContent, { initialTab }))
}

test('브리더의 저장목록에는 입양목록 탭이 없고, 그 탭으로 들어와도 첫 탭을 연다', () => {
  assert.match(bookmarks('adopter', 'adoption-list'), /data-value="adoption-list">[^<]*입양목록/)
  const breeder = bookmarks('breeder', 'adoption-list')
  assert.doesNotMatch(breeder, /입양목록/)
  assert.match(breeder, /data-value="favorites"/)
})

const ctaBar = (props) => {
  const { AdoptionCtaBar } = loadTypescript('src/app/(main)/adoption/[id]/_ui/AdoptionCtaBar.tsx', {
    'next/link': {
      __esModule: true,
      default: ({ href, children }) => createElement('a', { href }, children),
    },
    '@/features/chat-entry': {
      ApplicationChatButton: ({ label }) => createElement('button', null, label),
    },
    '@/shared/assets': { FavoriteIcon: () => null },
    '@/shared/ui': {
      buttonVariants: () => '',
      ToggleIconButton: () => null,
      Button: ({ disabled, children }) => createElement('button', { disabled }, children),
    },
    '@/shared/lib/cn': { cn: (...values) => values.filter(Boolean).join(' ') },
    '../_lib/actionLayout': { getActionLayout: () => '' },
  })
  return renderToStaticMarkup(
    createElement(AdoptionCtaBar, {
      listingId: 'pet-1',
      breederUserId: 'breeder-1',
      isFavorite: false,
      onToggleFavorite: () => {},
      ...props,
    }),
  )
}

const applyPage = (userRole) => {
  const page = loadTypescript('src/app/(main)/adoption/[id]/apply/page.tsx', {
    'next/navigation': { useParams: () => ({ id: 'pet-1' }) },
    '@tanstack/react-query': { useQuery: () => ({ isPending: false, data: { id: 'pet-1' } }) },
    '@/shared/ui': {
      AsyncState: ({ status, message, action }) =>
        createElement('div', { 'data-state': status }, message, action),
      DetailLink: ({ href, label }) => createElement('a', { href }, label),
    },
    '@/entities/adoption': { adoptionQueries: { detail: () => ({}) } },
    '@/features/auth': { useAuthStatus: () => ({ userRole }) },
    '../_lib/mapAdoptionDetail': { mapAdoptionDetail: (data) => data },
    './_ui/ApplicationForm': { ApplicationForm: () => createElement('form') },
  })
  return renderToStaticMarkup(createElement(page.default))
}

test('브리더가 신청 주소로 바로 들어오면 신청서 대신 이유와 분양글로 돌아갈 링크를 보여준다', () => {
  assert.match(applyPage('adopter'), /<form>/)
  const breeder = applyPage('breeder')
  assert.doesNotMatch(breeder, /<form>/)
  assert.match(breeder, /입양 신청은 입양자만 할 수 있어요\.<a href="\/adoption\/pet-1">/)
})

test('브리더에게는 신청 버튼만 이유와 함께 비활성으로 바꾸고 문의하기는 남긴다', () => {
  assert.match(ctaBar({}), /href="\/adoption\/pet-1\/apply"/)
  const breeder = ctaBar({ applyDisabledReason: '입양자 전용' })
  assert.match(breeder, /문의하기/)
  assert.match(breeder, /<button disabled="">[\s\S]*입양자 전용/)
  assert.doesNotMatch(breeder, /\/apply/)
})
