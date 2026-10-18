const {
  test,
  assert,
  isPetEnvironmentAllowed,
  petExposureMode,
  env,
} = require('./fixtures/core.fixture.cjs')

test('개발 호스트와 명시적 로컬 환경은 실행 모드와 무관하게 허용함', () => {
  for (const hostname of [
    'dev.pawpong.kr',
    'localhost:3033',
    '127.0.0.1:3033',
    '10.0.2.2:3033',
    '[::1]:3033',
  ]) {
    assert.equal(isPetEnvironmentAllowed({ ...env, hostname }), true)
  }
})

test('운영 배포와 미허용 브랜치 및 알 수 없는 호스트와 누락된 설정은 닫아 둠', () => {
  for (const patch of [
    { deploymentEnv: 'production' },
    { branch: 'main' },
    { branch: 'master' },
    { appEnv: 'production' },
    { appEnv: undefined },
    { enabled: undefined },
    { enabled: 'false' },
    { enabled: 'TRUE' },
    { hostname: 'pawpong.kr' },
    { hostname: 'www.pawpong.kr' },
    { hostname: 'dev.pawpong.kr.attacker.test' },
    { hostname: 'preview.vercel.app' },
    { hostname: '' },
  ]) {
    assert.equal(isPetEnvironmentAllowed({ ...env, ...patch }), false, JSON.stringify(patch))
  }
})

test('실제 운영 배포와 대표 호스트만 공개 승인 상태를 조회할 수 있음', () => {
  const production = {
    appEnv: 'production',
    deploymentEnv: 'production',
    branch: 'main',
    hostname: 'pawpong.kr',
  }
  assert.equal(petExposureMode(production), 'public')
  assert.equal(petExposureMode({ ...production, hostname: 'www.pawpong.kr' }), 'public')
  for (const patch of [
    { deploymentEnv: 'preview' },
    { deploymentEnv: undefined },
    { branch: 'dev' },
    { branch: undefined },
    { appEnv: 'development' },
    { hostname: 'localhost:3033' },
    { hostname: 'pawpong.kr.attacker.test' },
    { hostname: 'dev.pawpong.kr' },
  ])
    assert.equal(petExposureMode({ ...production, ...patch }), null)
})
