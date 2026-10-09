const { test } = require('node:test')
const assert = require('node:assert/strict')
const { renderToStaticMarkup } = require('react-dom/server')
const { createElement } = require('react')
const { loadTypescript } = require('../helpers/load-typescript.cjs')
const { source } = require('./fixtures/alignment.fixture.cjs')

const cn = (...values) => values.filter(Boolean).join(' ')
const { GridSkeleton } = loadTypescript('src/shared/ui/Skeleton.tsx', { '@/shared/lib/cn': { cn } })

test('격자 스켈레톤은 실제 격자 틀에 빈 칸을 채우고 안내 문구는 낭독용으로만 둠', () => {
  const html = renderToStaticMarkup(
    createElement(GridSkeleton, {
      label: '불러오는 중이에요.',
      count: 3,
      className: 'grid grid-cols-3',
    }),
  )
  assert.match(html, /role="status"/)
  assert.match(html, /aria-busy="true"/)
  assert.match(html, /<span class="sr-only">불러오는 중이에요\.<\/span>/)
  assert.match(html, /<div class="grid grid-cols-3">/)
  assert.equal(html.match(/aspect-square/g).length, 3)
  assert.match(html, /motion-reduce:animate-none/)
})

test('마이홈 글 격자와 AI 사진 보관함은 로딩 중에 같은 격자의 스켈레톤을 보여줌', () => {
  assert.match(
    source('src/shared/ui/ListState.tsx'),
    /loadingFallback \?\? <AsyncState status="loading"/,
  )
  const grid = source('src/app/(main)/home/_ui/HomePostGrid.tsx')
  assert.match(grid, /loadingFallback=\{\s*<GridSkeleton[\s\S]*?className=\{gridClasses\}/)
  assert.match(grid, /<div className=\{gridClasses\}>/)
  assert.match(
    source('src/features/ai-image/ui/AiPhotoArchive.tsx'),
    /<GridSkeleton\s+label="보관함을 불러오는 중이에요\."/,
  )
})

test('놀이터 AI 예시는 불러오는 동안 같은 3칸 틀의 스켈레톤을 보여줌', () => {
  const skeleton = loadTypescript('src/shared/ui/Skeleton.tsx', { '@/shared/lib/cn': { cn } })
  const { FeatureShowcaseTilesSkeleton } = loadTypescript('src/shared/ui/FeatureShowcase.tsx', {
    'next/image': () => null,
    '@/shared/assets': { PawPrintIcon: () => null },
    '@/shared/lib/cn': { cn },
    './Skeleton': skeleton,
  })
  const html = renderToStaticMarkup(
    createElement(FeatureShowcaseTilesSkeleton, { label: 'AI 필터 예시를 불러오고 있어요.' }),
  )
  assert.match(html, /aria-busy="true"/)
  assert.match(html, /<span class="sr-only">AI 필터 예시를 불러오고 있어요\.<\/span>/)
  assert.equal(html.match(/aspect-square/g).length, 3)
  assert.match(
    source('src/app/(main)/playground/_ui/PlaygroundContent.tsx'),
    /filters\.isPending \? \(\s*<FeatureShowcaseTilesSkeleton/,
  )
})

test('탐색 목록은 불러오는 동안 같은 격자에 카드 모양 스켈레톤을 채움', () => {
  const skeleton = loadTypescript('src/shared/ui/Skeleton.tsx', { '@/shared/lib/cn': { cn } })
  const tv = require('tailwind-variants').tv
  const { ListingCardGridSkeleton } = loadTypescript('src/shared/ui/ListingCardGrid.tsx', {
    '@/shared/lib/tv': { tv },
    '@/shared/lib/cn': { cn },
    './Skeleton': skeleton,
  })
  const html = renderToStaticMarkup(
    createElement(ListingCardGridSkeleton, { label: '분양글을 불러오는 중이에요.', count: 2 }),
  )
  assert.match(html, /role="status" aria-busy="true"/)
  assert.match(html, /<span class="sr-only">분양글을 불러오는 중이에요\.<\/span>/)
  assert.equal(html.match(/aspect-\[348\/284\]/g).length, 2)
  assert.match(html, /grid grid-cols-2/)
  for (const file of [
    'src/app/(main)/explore/_ui/ExploreContent.tsx',
    'src/app/(main)/explore/_ui/BreederExploreContent.tsx',
  ])
    assert.match(source(file), /loadingFallback=\{<ListingCardGridSkeleton label=/, file)
})

test('홈 분양·자랑하기 영역은 불러온 카드와 같은 배치의 스켈레톤으로 자리를 잡아 둠', () => {
  const adoption = source('src/widgets/adoption-showcase/ui/AdoptionShowcase.tsx')
  assert.match(adoption, /<div className=\{GRID_CLASS\}>/)
  assert.match(adoption, /loadingFallback=\{[\s\S]*?<div className=\{GRID_CLASS\} aria-hidden>/)
  const community = source('src/widgets/community-showcase/ui/CommunityShowcase.tsx')
  assert.match(community, /<div className=\{ROW_CLASS\}>/)
  assert.match(community, /loadingFallback=\{[\s\S]*?<div className=\{ROW_CLASS\} aria-hidden>/)
  for (const code of [adoption, community]) assert.match(code, /role="status" aria-busy="true"/)
})

test('관심 입양글·즐겨찾는 브리더·브리더 홈 분양 목록도 각자 격자 배치의 카드 스켈레톤을 씀', () => {
  assert.match(
    source('src/app/(main)/bookmarks/_ui/FavoritesTab.tsx'),
    /loadingFallback=\{<ListingCardGridSkeleton label="관심 목록을 불러오는 중이에요\." \/>\}/,
  )
  assert.match(
    source('src/app/(main)/home/_ui/FavoriteBreedersContent.tsx'),
    /<ListingCardGridSkeleton[\s\S]*?layout="compact"[\s\S]*?className=\{gridClassName\}/,
  )
  assert.match(
    source('src/app/(main)/home/[userId]/_ui/PublicBreederListings.tsx'),
    /<ListingCardGridSkeleton[\s\S]*?layout="publicBreeder"[\s\S]*?className=\{gridClassName\}/,
  )
})
