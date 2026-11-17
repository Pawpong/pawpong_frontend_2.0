// CLAUDE.md "코딩 규칙" 중 기계로 확인할 수 있는 것만 검사한다.
// 문서는 Claude 만 읽으므로, 사람이나 다른 도구가 쓴 코드도 CI(코드 검사)에서 걸리게 한다.
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const files = fs
  .readdirSync('src', { recursive: true })
  .filter((file) => /\.tsx?$/.test(file))
  .map((file) => path.join('src', file).split(path.sep).join('/'))

// 주석 줄은 규칙 설명이나 이전 값 기록일 수 있어 빼고 본다
const codeLines = (file) =>
  fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .map((text, index) => ({ text, line: index + 1 }))
    .filter(({ text }) => !/^\s*(\/\/|\/?\*)/.test(text))

const violations = (pattern, { skip = () => false } = {}) =>
  files
    .filter((file) => !skip(file))
    .flatMap((file) =>
      codeLines(file)
        .filter(({ text }) => pattern.test(text))
        .map(({ text, line }) => `${file}:${line}  ${text.trim()}`),
    )

const expectNone = (found, rule) => assert.deepEqual(found, [], `${rule}\n${found.join('\n')}`)

test('타입 단언 as any / as never / as unknown 과 @ts-ignore 를 쓰지 않는다', () => {
  expectNone(violations(/\bas (any|never|unknown)\b|@ts-ignore/), '타입을 고쳐서 맞춘다')
})

test('Radix 는 shared/ui 안에서만 import 한다', () => {
  expectNone(
    violations(/from ['"](@radix-ui\/|radix-ui['"])/, {
      skip: (file) => file.startsWith('src/shared/ui/'),
    }),
    'shared/ui 의 래퍼(예: DialogBareContent)를 쓴다',
  )
})

test('cva 대신 tailwind-variants 의 tv 를 쓴다', () => {
  expectNone(violations(/class-variance-authority/), 'tv 로 바꾼다')
})

// 규칙을 넣을 때(2026-11-17) 이미 있던 곳. 새로 늘리지 않고, Query Factory 로 옮기면 여기서도 지운다.
const QUERY_KEY_BASELINE = {
  // shared 는 entities/gamification 을 import 할 수 없어(FSD) 활동 점수 키를 직접 쓴다
  'src/shared/lib/QueryProvider.tsx': 2,
  'src/app/(main)/(page)/level/_ui/LevelGuideContent.tsx': 1,
  'src/app/(main)/chat/_ui/ChatUserSearch.tsx': 1,
  'src/entities/community/api/communityExperience.api.ts': 1,
  'src/entities/community/api/communityReview.api.ts': 1,
  'src/entities/gamification/api/activity.api.ts': 1,
  'src/features/adopter/api/adopter.mutations.ts': 4,
  'src/features/chat-directory/ui/ChatPrivacySetting.tsx': 1,
  'src/features/gamification/lib/usePublicActivityBadges.ts': 1,
  'src/features/gamification/ui/ActivityDashboard.tsx': 2,
  'src/features/gamification/ui/MyLevelBadge.tsx': 1,
  'src/features/in-app-purchase/ui/PlaygroundBilling.tsx': 3,
  'src/features/in-app-purchase/ui/PurchaseProvider.tsx': 2,
  'src/features/onboarding/ui/PhoneVerificationSection.tsx': 1,
  'src/features/pet-posting/api/pet-posting.mutations.ts': 1,
  'src/features/playground-pet/lib/usePetController.ts': 2,
  'src/features/playground-pet/ui/PetAdoption.tsx': 1,
  'src/features/playground-pet/ui/PetResultLink.tsx': 1,
  'src/features/send-message/api/send-message.mutations.ts': 1,
  'src/widgets/feature-highlights/ui/FeatureHighlights.tsx': 1,
}

test('queryKey 배열은 Query Factory(*.queries.ts) 에서만 만든다', () => {
  const found = violations(/queryKey:\s*\[/, { skip: (file) => file.endsWith('.queries.ts') })
  const perFile = {}
  for (const entry of found) {
    const file = entry.slice(0, entry.indexOf(':'))
    perFile[file] = (perFile[file] ?? 0) + 1
  }
  const added = found.filter((entry) => {
    const file = entry.slice(0, entry.indexOf(':'))
    return perFile[file] > (QUERY_KEY_BASELINE[file] ?? 0)
  })
  expectNone(added, '키는 Query Factory 에 두고 domainQueries.x().queryKey 를 쓴다')
})

test('길이 임의값은 px 대신 rem 으로 쓴다', () => {
  // min-[420px]: 같은 화면 폭 기준점은 Tailwind 문법상 px 가 맞아서 뺀다
  expectNone(violations(/(?<!min-|max-)\[\d+(\.\d+)?px\]/), 'rem 으로 바꾼다 (16px = 1rem)')
})
