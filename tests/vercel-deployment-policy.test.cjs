const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'))
const dependency = require(
  require.resolve('minimatch', {
    paths: [path.dirname(require.resolve('eslint/package.json'))],
  }),
)
const matches = typeof dependency === 'function' ? dependency : dependency.minimatch

test('자동 배포는 개발과 운영 브랜치만 명시적으로 허용함', () => {
  assert.deepEqual(config.git.deploymentEnabled, { '**': false, dev: true, main: true })
})

test('슬래시가 있는 기능 브랜치도 배포 생성 단계에서 차단함', () => {
  const allowed = (branch) => {
    const rules = Object.entries(config.git.deploymentEnabled).filter(([pattern]) =>
      matches(branch, pattern),
    )
    return rules.length ? rules.some(([, enabled]) => enabled) : true
  }
  for (const branch of ['dev', 'main']) assert.equal(allowed(branch), true, branch)
  for (const branch of [
    'kscold/dev-pet-room-shop',
    'kscold/dev-activity-community',
    'kscold/seo-app-links-main',
    'feature/community',
    'fix/nested/issue',
    'test',
    'main-fix',
    'dev-backup',
    'production',
  ]) {
    assert.equal(allowed(branch), false, branch)
  }
})

test('배포 한도를 소비하는 사후 빌드 건너뛰기를 차단 정책으로 사용하지 않음', () => {
  assert.equal(config.ignoreCommand, undefined)
})
