const { test } = require('node:test')
const assert = require('node:assert/strict')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { loadTypescript: load } = require('./helpers/load-typescript.cjs')

const Link = ({ href, children, prefetch, ...props }) =>
  React.createElement('a', { href, ...props }, children)
const CardImage = ({ alt }) => React.createElement('span', { role: 'img', 'aria-label': alt })
const icons = { ArrowRightIcon: () => null, PawPrintIcon: () => null }
const common = {
  'next/link': { default: Link },
  './CardImage': { CardImage },
  '@/shared/assets': icons,
}

test('portrait card keeps favorite button outside links and names the destination', () => {
  const { MediaCard } = load('src/shared/ui/MediaCard.tsx', common)
  const html = renderToStaticMarkup(
    React.createElement(MediaCard, {
      href: '/home/example',
      title: '긴 이름',
      alt: '브리더',
      description: '서울',
      action: React.createElement(
        'button',
        { type: 'button', 'aria-label': '즐겨찾기', 'aria-pressed': true },
        '별',
      ),
    }),
  )
  assert.match(html, /aria-label="긴 이름 상세 보기"/)
  assert.match(html, /aria-pressed="true"/)
  for (const anchor of html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g))
    assert.doesNotMatch(anchor[1], /<button/)
})

test('summary card remains one navigable link with missing image and long content', () => {
  const { SummaryCard } = load('src/shared/ui/SummaryCard.tsx', common)
  const html = renderToStaticMarkup(
    React.createElement(SummaryCard, {
      href: '/adoption/example',
      title: '아주 긴 동물 이름'.repeat(8),
      description: '설명'.repeat(100),
      status: '분양중',
    }),
  )
  assert.equal((html.match(/<a\b/g) || []).length, 1)
  assert.match(html, /href="\/adoption\/example"/)
  assert.match(html, /분양중/)
})

test('photo tile preserves held review status alongside photo count', () => {
  const { PhotoTile } = load('src/shared/ui/PhotoTile.tsx', common)
  const html = renderToStaticMarkup(
    React.createElement(PhotoTile, {
      href: '/community/post/example',
      alt: '우리 아이',
      count: 3,
      sizes: '33vw',
      status: '공개 보류',
    }),
  )
  assert.match(html, /우리 아이 게시글 보기/)
  assert.match(html, /공개 보류/)
  assert.match(html, /3장/)
})

test('card image retries an authenticated URL after the login session changes', () => {
  let failed
  let scope = 'first'
  const { CardImage: Image } = load('src/shared/ui/CardImage.tsx', {
    react: {
      ...React,
      useState: () => [
        failed,
        (next) => {
          failed = next
        },
      ],
    },
    './SessionImage': { SessionImage: 'session-image' },
    '@/shared/assets': icons,
    '@/shared/lib/useAuthReadSession': { useAuthReadSession: () => ({ scope }) },
    '@/shared/lib/sessionImageSource': {
      isSessionImageSource: () => true,
      sessionImageSource: (src, key) => `${src}?session=${key}`,
    },
  })
  const props = { src: '/api/private-photo', alt: '사진', sizes: '100vw' }
  Image(props).props.onError()
  assert.equal(Image(props).props.role, 'img')
  scope = 'second'
  assert.equal(Image(props).type, 'session-image')
})
