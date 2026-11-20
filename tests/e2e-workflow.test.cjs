const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

// 배포 E2E 가 운영 반영을 막는 검사라, 브라우저 이미지와 설치된 Playwright 버전이 어긋나면 모든 운영 배포가 멈춘다.
test('배포 E2E 컨테이너는 설치된 Playwright 와 같은 버전이다', () => {
  const workflow = fs.readFileSync('.github/workflows/e2e.yml', 'utf8')
  const { version } = require('@playwright/test/package.json')
  assert.match(
    workflow,
    new RegExp(`mcr\\.microsoft\\.com/playwright:v${version.replace(/\./g, '\\.')}-`),
  )
})
