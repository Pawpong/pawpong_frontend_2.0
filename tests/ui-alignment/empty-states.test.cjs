const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { source } = require('./fixtures/alignment.fixture.cjs')

test('개인 목록이 비면 같은 모양의 버튼으로 다음 행동을 안내함', () => {
  const cases = [
    ['src/app/(main)/home/_ui/MyPostsTab.tsx', '/community/write'],
    ['src/app/(main)/home/_ui/FavoriteBreedersContent.tsx', '/explore'],
    ['src/app/(main)/bookmarks/_ui/FavoritesTab.tsx', '/explore?type=adoption'],
    ['src/app/(main)/bookmarks/_ui/SavedFeedsTab.tsx', '/community'],
    ['src/features/ai-image/ui/AiPhotoArchive.tsx', '/ai-filter'],
  ]
  for (const [file, href] of cases) {
    const code = source(file)
    assert.match(code, new RegExp(`<EmptyStateLink href="${href.replace(/[?]/g, '\\?')}"`), file)
  }
  assert.match(source('src/app/(main)/home/_ui/HomePostGrid.tsx'), /emptyAction=\{emptyAction\}/)
})

test('목록 화면의 로딩·오류·빈 상태 문구는 해요체로 맞춤', () => {
  const roots = [
    'src/app/(main)/home',
    'src/app/(main)/bookmarks',
    'src/app/(main)/drafts',
    'src/app/(main)/notices',
    'src/app/(main)/notifications',
    'src/app/(main)/explore',
    'src/app/(main)/faq',
    'src/widgets/community-showcase',
    'src/widgets/adoption-showcase',
    'src/widgets/my-pet-postings',
  ]
  const repo = path.resolve(__dirname, '../..')
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name)
      return entry.isDirectory() ? walk(full) : /\.tsx?$/.test(entry.name) ? [full] : []
    })
  for (const root of roots)
    for (const file of walk(path.join(repo, root))) {
      const code = fs.readFileSync(file, 'utf8')
      assert.doesNotMatch(code, /불러오는 중입니다|불러오지 못했습니다|(?<!\/\/.*)없습니다\./, file)
    }
})

test('링크 티켓은 누르면 그림자 쪽으로 내려앉고 움직임을 줄인 환경에서는 움직이지 않음', () => {
  const css = source('src/shared/ui/Ticket.module.css')
  assert.match(css, /a\.ticket:active \{\s*translate: 3px 3px;\s*box-shadow: 3px 3px 0 var\(--accent\);/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*a\.ticket:active \{\s*translate: none;/)
})
