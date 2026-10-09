const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { source } = require('./fixtures/alignment.fixture.cjs')

const repo = path.resolve(__dirname, '../..')

// 담당자 영역(채팅·명예의 전당·돌봄 지도·반려동물 키우기)과 놀이터 작업 경로는 각 작업에서 따로 맞춘다.
const EXCLUDED = [
  /^src\/app\/\(main\)\/chat\//,
  /^src\/features\/chat-[^/]+\//,
  /^src\/entities\/chat\//,
  /^src\/widgets\/chat[^/]*\//,
  /hall-of-fame/,
  /^src\/features\/care-map\//,
  /^src\/app\/\(main\)\/care-map\//,
  /^src\/features\/playground-pet\//,
  /^src\/entities\/playground-pet\//,
  /^src\/features\/playground-tools\//,
  /^src\/app\/\(main\)\/playground\//,
  /^src\/widgets\/care-map-entry\//,
  /^src\/widgets\/feature-highlights\//,
  /^src\/shared\/ui\/(RadioCardGroup|PixelProgressBar|Ticket|FeatureShowcase|FeatureIntro)\.tsx$/,
  /^src\/app\/\(main\)\/community\/_ui\/(CommunityPostEditor|CommunityExperiencePanel)\.tsx$/,
  /^src\/app\/\(main\)\/_ui\/ManagedFeatureHighlights\.tsx$/,
]

// 실제로 비활성 상태에만 붙는 회색은 대비 기준 예외라 남긴다.
const DISABLED_ONLY = [
  ['src/shared/ui/Badge.tsx', "disabled: 'bg-neutral-150"],
  ['src/shared/ui/PixelTab.tsx', "disabled: { root: 'text-neutral-400'"],
  ['src/shared/ui/TextareaField.tsx', "disabled: 'text-neutral-400'"],
  // 아직 오지 않은 온보딩 단계 화살표. 단계 칩의 비활성 표시와 짝을 맞춘다.
  ['src/features/onboarding/ui/StepIndicator.tsx', ": 'text-neutral-400'"],
]

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : /\.tsx?$/.test(entry.name) ? [full] : []
  })

test('정보를 전하는 회색 글자는 neutral-700 이상을 쓰고 옅은 회색은 비활성·자리 표시 상태에만 남김', () => {
  // disabled:·placeholder: 같은 상태 변형이 붙은 클래스는 앞에 ':'가 와서 걸리지 않는다.
  const light = /(?<![\w:\-[])text-neutral-(400|500|600)(?![\w-])/
  for (const file of walk(path.join(repo, 'src'))) {
    const rel = path.relative(repo, file).split(path.sep).join('/')
    if (EXCLUDED.some((pattern) => pattern.test(rel))) continue
    fs.readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        if (!light.test(line)) return
        if (DISABLED_ONLY.some(([owner, key]) => owner === rel && line.includes(key))) return
        assert.fail(`${rel}:${index + 1} ${line.trim()}`)
      })
  }
})

test('날짜·통계·작성자·하단 메뉴 같은 공통 보조 글자도 같은 회색을 씀', () => {
  for (const [file, pattern] of [
    [
      'src/shared/ui/PostedDate.tsx',
      /base: 'flex items-center gap-\[0\.438rem\] text-neutral-700'/,
    ],
    ['src/shared/ui/ListingStats.tsx', /base: 'flex items-center font-medium text-neutral-700'/],
    ['src/shared/config/typography.ts', /meta: '[^']*text-neutral-700/],
    ['src/widgets/bottom-nav/ui/BottomNav.tsx', /justify-center text-neutral-700 focus-ring-inset/],
    ['src/shared/ui/SectionHeader.tsx', /text-xs font-bold text-neutral-700/],
  ])
    assert.match(source(file), pattern, file)
  for (const file of [
    'src/shared/ui/AuthorInfo.tsx',
    'src/shared/ui/Breadcrumb.tsx',
    'src/widgets/post-form/ui/VisibilitySelect.tsx',
    'src/app/(main)/community/post/[postId]/_ui/CommentList.tsx',
  ])
    assert.doesNotMatch(source(file), /text-text-(secondary|muted)\b/, file)
  // 분양완료 같은 상태 뱃지는 비활성 버튼이 아니라 읽어야 하는 정보다.
  assert.match(
    source('src/shared/ui/Badge.tsx'),
    /neutralFilled: 'bg-neutral-150 text-neutral-700'/,
  )
})
