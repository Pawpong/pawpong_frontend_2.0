import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveSentryEnvironment as resolve, createErrorBudget } from '../sentry.environment.ts'
const base = {
  nodeEnv: 'production',
  environment: 'production',
  productionDsn: 'prod',
  hostname: 'pawpong.kr',
}
test('운영 도메인과 명시된 운영 환경만 운영 DSN 사용함', () =>
  assert.equal(resolve(base).dsn, 'prod'))
test('localhost 운영 빌드도 운영 DSN 사용하지 않음', () =>
  assert.equal(resolve({ ...base, hostname: 'localhost' }).enabled, false))
test('프리뷰는 운영 DSN 사용하지 않음', () =>
  assert.equal(resolve({ ...base, environment: 'preview' }).enabled, false))
test('개발 서버는 운영 설정이 복사돼도 보내지 않음', () =>
  assert.equal(resolve({ ...base, nodeEnv: 'development' }).enabled, false))
test('개발 opt-in은 서로 다른 DSN일 때만 허용함', () => {
  assert.equal(
    resolve({ ...base, nodeEnv: 'development', developmentDsn: 'prod', enableDevelopment: 'true' })
      .enabled,
    false,
  )
  assert.equal(
    resolve({ ...base, nodeEnv: 'development', developmentDsn: 'dev', enableDevelopment: 'true' })
      .dsn,
    'dev',
  )
})

test('반복 오류와 실행 환경당 분당 20건 제한 및 다음 창 복구', () => {
  let time = 0
  const filter = createErrorBudget(() => time)
  assert.ok(filter({ message: 'first' }))
  assert.equal(filter({ message: 'first' }), null)
  for (let i = 1; i < 20; i++) assert.ok(filter({ message: String(i) }))
  assert.equal(filter({ message: 'overflow' }), null)
  time = 60_000
  assert.ok(filter({ message: 'first' }))
})
