const { test } = require('node:test')
const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const { readdirSync, readFileSync, statSync } = require('node:fs')
const { join } = require('node:path')

test('FSD 규칙(steiger)에 걸리는 곳이 없다', () => {
  const run = spawnSync('pnpm', ['exec', 'steiger', './src'], { encoding: 'utf8' })
  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`)
})

// app 계층은 서버 전용 진입점(<슬라이스>/server.ts)을 써야 해서 steiger 의 진입점 우회 규칙을 끈다.
// 대신 여기서 "app 의 안쪽 import 는 /server 진입점뿐"인지 확인한다. 아래 목록만 이유가 있는 예외다.
const ALLOWED_DEEP_IMPORTS = {
  // 펫 방 화면 전체(CSS 포함)를 진입점에 넣으면 작은 링크(PetResultLink)만 쓰는 마이홈·AI 필터에도 실린다
  '@/features/playground-pet/ui/PetPage': '펫 화면 번들 분리',
  // 놀이터 도구 진입점에는 다른 도구 화면(클라이언트)이 묶여 있어, 카드 페이지·사이트맵은 필요한 것만 가져온다
  '@/features/playground-tools/model/discovery': '카드 페이지·사이트맵 번들 분리',
  '@/features/playground-tools/model/playCardLinks': '카드 페이지·사이트맵 번들 분리',
  '@/features/playground-tools/ui/PlayResultCard': '카드 페이지 번들 분리',
  '@/features/playground-tools/ui/SharedPlayCardActions': '카드 페이지 번들 분리',
  '@/features/playground-tools/ui/ToolPage': '카드 페이지 번들 분리',
}

// 로컬에만 두는 시안·실험 페이지는 검사하지 않는다 (steiger 설정의 ignores 와 같다)
const LOCAL_ONLY = /\/(dev|lab|home-preview)(\/|$)/
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (LOCAL_ONLY.test(path)) return []
    return statSync(path).isDirectory() ? walk(path) : /\.tsx?$/.test(name) ? [path] : []
  })

test('app 계층은 위 계층 슬라이스의 안쪽을 /server 진입점으로만 가져온다', () => {
  const deep = /from '(@\/(?:entities|features|widgets)\/[a-z-]+\/[^']+)'/g
  const violations = walk('src/app').flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(deep)]
      .map((match) => match[1])
      .filter((path) => !path.endsWith('/server') && !(path in ALLOWED_DEEP_IMPORTS))
      .map((path) => `${file}: ${path}`),
  )
  assert.deepEqual(violations, [])
})
