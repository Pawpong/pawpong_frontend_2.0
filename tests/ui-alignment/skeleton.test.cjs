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
    './Ticket': { TicketStrip: () => null, ticketStyles: {} },
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
    source('src/app/(main)/bookmarks/_ui/FavoriteBreedersContent.tsx'),
    /<ListingCardGridSkeleton[\s\S]*?layout="compact"[\s\S]*?className=\{gridClassName\}/,
  )
  assert.match(
    source('src/app/(main)/home/[userId]/_ui/PublicBreederListings.tsx'),
    /<ListingCardGridSkeleton[\s\S]*?layout="publicBreeder"[\s\S]*?className=\{gridClassName\}/,
  )
})

test('알림센터는 불러오는 동안 알림 행과 같은 틀의 스켈레톤을 보여줌', () => {
  const page = source('src/app/(main)/notifications/_ui/NotificationsContent.tsx')
  assert.match(
    page,
    /loadingFallback=\{[\s\S]*?<span className="sr-only">알림을 불러오는 중이에요\.<\/span>/,
  )
  assert.match(page, /px-4 py-4 tab:px-5 tab:py-5/)
})

test('분양 상세는 불러오는 동안 실제 화면과 같은 틀의 스켈레톤을 보여줌', () => {
  const client = source('src/app/(main)/adoption/[id]/_ui/AdoptionDetailPageClient.tsx')
  assert.match(client, /if \(detailQuery\.isPending\) return <AdoptionDetailSkeleton \/>/)
  const skeleton = source('src/app/(main)/adoption/[id]/_ui/AdoptionDetailSkeleton.tsx')
  assert.match(skeleton, /role="status" aria-busy="true"/)
  assert.match(skeleton, /aspect-\[375\/279\] w-full rounded-none tab:aspect-square/)
  assert.match(skeleton, /lap:w-\[20rem\] lap:shrink-0 pc:w-\[24rem\]/)
})

test('게시글 상세는 불러오는 동안 두 배치 모두 실제 글 모양의 스켈레톤을 보여주고 빈 글 문구는 해요체', () => {
  const panel = source('src/app/(main)/community/_ui/PostDetailPanel.tsx')
  assert.match(panel, /if \(!post && isPending && !isError\) \{/)
  assert.match(panel, /<SkeletonBlock className="h-full w-\[60%\] shrink-0 rounded-none" \/>/)
  assert.match(panel, /<SkeletonBlock className="aspect-square w-full shrink-0 rounded-none" \/>/)
  assert.match(panel, /삭제되었거나 볼 수 없는 게시글이에요\./)
  assert.doesNotMatch(panel, /게시글입니다/)
})

test('마이홈·다른 회원 홈은 프로필을 불러오는 동안 실제 2단 틀의 스켈레톤을 그림', () => {
  const skeleton = loadTypescript('src/shared/ui/Skeleton.tsx', { '@/shared/lib/cn': { cn } })
  const columns = loadTypescript('src/app/(main)/home/_ui/HomeColumns.tsx', {
    '@/shared/ui': {
      Container: ({ children, className }) => createElement('div', { className }, children),
    },
  })
  const { HomeSkeleton } = loadTypescript('src/app/(main)/home/_ui/HomeSkeleton.tsx', {
    '@/shared/ui/Skeleton': skeleton,
    './HomeColumns': columns,
  })
  const html = renderToStaticMarkup(createElement(HomeSkeleton))
  assert.match(html, /role="status" aria-busy="true"/)
  assert.match(html, /<span class="sr-only">프로필을 불러오는 중이에요\.<\/span>/)
  assert.match(html, /size-20 rounded-full/)
  assert.equal(html.match(/aspect-square/g).length, 6)
  assert.match(
    source('src/app/(main)/home/_ui/MyHomeContent.tsx'),
    /profileQuery\.isPending \? \(\s*<HomeSkeleton \/>/,
  )
})

test('다른 회원 홈(일반·브리더)도 프로필을 불러오는 동안 같은 홈 스켈레톤을 씀', () => {
  for (const file of [
    'src/app/(main)/home/[userId]/_ui/UserHomeContent.tsx',
    'src/app/(main)/home/[userId]/_ui/BreederHomeContent.tsx',
  ])
    assert.match(source(file), /if \(!profileQuery\.isError\) return <HomeSkeleton \/>/, file)
  assert.match(
    source('src/app/(main)/home/[userId]/_ui/UserHomeRouter.tsx'),
    /return <HomeSkeleton \/>/,
  )
})

// 저장 피드는 마이홈 게시글 탭의 '저장한 글' 칩으로 옮겨 게시글 격자 스켈레톤을 쓴다
test('공지·자주 묻는 질문·임시저장은 줄 모양 스켈레톤으로 불러오는 자리를 잡음', () => {
  const { ListRowsSkeleton } = loadTypescript('src/shared/ui/Skeleton.tsx', {
    '@/shared/lib/cn': { cn },
  })
  const html = renderToStaticMarkup(
    createElement(ListRowsSkeleton, { label: '공지사항을 불러오는 중이에요.', rows: 3 }),
  )
  assert.match(html, /role="status" aria-busy="true"/)
  assert.equal(html.match(/py-4/g).length, 3)
  for (const [file, pattern] of [
    [
      'src/app/(main)/faq/_ui/FaqContent.tsx',
      /<ListRowsSkeleton label="자주 묻는 질문을 불러오는 중이에요\." rows=\{6\} \/>/,
    ],
    [
      'src/app/(main)/notices/_ui/NoticesContent.tsx',
      /<ListRowsSkeleton label="공지사항을 불러오는 중이에요\." \/>/,
    ],
    [
      'src/app/(main)/drafts/_ui/DraftSection.tsx',
      /<ListRowsSkeleton label=\{loadingText\} rows=\{3\} \/>/,
    ],
  ])
    assert.match(source(file), pattern, file)
})

test('상단 알림 드롭다운도 불러오는 동안 줄 스켈레톤을 쓰고 안내 줄 글자 대비를 지킴', () => {
  const bell = source('src/widgets/gnb/ui/NotificationBell.tsx')
  assert.match(
    bell,
    /<ListRowsSkeleton label="알림을 불러오는 중이에요\." rows=\{3\} className="px-4" \/>/,
  )
  assert.doesNotMatch(bell, /불러오는 중\.\.\./)
  assert.match(bell, /text-xs text-neutral-700">\s*지운 알림도/)
})

test('신청·후기 목록은 줄 스켈레톤으로 불러오고 보낸 신청이 없으면 분양중인 동물로 안내함', () => {
  const layout = source('src/app/(main)/activity/_ui/ActivityListLayout.tsx')
  assert.match(
    layout,
    /loadingFallback=\{<ListRowsSkeleton label=\{`\$\{title\}을 불러오는 중이에요\.`\} rows=\{3\} \/>\}/,
  )
  assert.match(layout, /emptyAction=\{emptyAction\}/)
  assert.match(
    source('src/app/(main)/activity/_ui/ActivityInfiniteList.tsx'),
    /emptyAction=\{emptyAction\}/,
  )
  assert.match(
    source('src/app/(main)/activity/_ui/ApplicationList.tsx'),
    /<EmptyStateLink href="\/explore\?type=adoption">분양중인 동물 보기<\/EmptyStateLink>/,
  )
})
