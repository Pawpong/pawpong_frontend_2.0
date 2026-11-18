const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

function load(path, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const output = {}
  new Function('exports', 'require', code)(output, (name) => dependencies[name])
  return output
}

const withBase = (base) =>
  load('src/shared/lib/socialLogin.ts', {
    '@/shared/config': { getApiBaseUrl: () => base },
  })

const { socialLoginUrl, isSocialProvider, SOCIAL_PROVIDER_LABEL } =
  withBase('https://api.pawpong.kr')

test('돌아갈 곳이 있으면 returnUrl 을 붙인다', () => {
  assert.equal(
    socialLoginUrl('kakao', '/chat'),
    'https://api.pawpong.kr/api/auth/kakao?returnUrl=%2Fchat',
  )
})

test('홈으로 돌아갈 때는 returnUrl 을 붙이지 않는다', () => {
  assert.equal(socialLoginUrl('naver', '/'), 'https://api.pawpong.kr/api/auth/naver')
})

test('쿼리가 있는 returnUrl 도 통째로 인코딩한다', () => {
  // 인코딩하지 않으면 roomId 가 OAuth 주소의 별도 파라미터로 새어 나간다.
  assert.equal(
    socialLoginUrl('google', '/chat?roomId=abc'),
    'https://api.pawpong.kr/api/auth/google?returnUrl=%2Fchat%3FroomId%3Dabc',
  )
})

test('API 주소가 비어 있으면 로컬 백엔드로 떨어진다', () => {
  const local = withBase('')
  assert.equal(local.socialLoginUrl('apple', '/'), 'http://localhost:8080/api/auth/apple')
})

test('아는 제공자만 통과시킨다', () => {
  // 백엔드가 보낸 provider 를 그대로 주소에 넣으므로 모르는 값은 막는다.
  for (const ok of ['kakao', 'naver', 'google', 'apple']) assert.equal(isSocialProvider(ok), true)
  for (const no of ['local', 'facebook', '', null, undefined])
    assert.equal(isSocialProvider(no), false)
})

test('제공자 이름은 버튼과 안내가 같은 것을 쓴다', () => {
  assert.deepEqual(SOCIAL_PROVIDER_LABEL, {
    kakao: '카카오',
    naver: '네이버',
    google: '구글',
    apple: 'Apple',
  })
})
