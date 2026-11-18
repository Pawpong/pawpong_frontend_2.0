const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

// 순수 가드 함수를 기존 TypeScript 도구로 로드한다. 브라우저/DB 접근 없음.
function load(relativePath) {
  const filename = path.resolve(__dirname, '..', relativePath)
  const source = fs.readFileSync(filename, 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  })
  const module = { exports: {} }
  const localRequire = (id) => {
    if (id.startsWith('@/')) return load('src/' + id.slice(2) + '.ts')
    if (!id.startsWith('.')) return require(id)
    return load(
      path.relative(
        path.resolve(__dirname, '..'),
        path.resolve(path.dirname(filename), id + '.ts'),
      ),
    )
  }
  new Function('require', 'module', 'exports', outputText)(localRequire, module, module.exports)
  return module.exports
}

const { getGuardRedirect } = load('src/features/onboarding/model/onboardingGuard.ts')

for (const userType of ['general', 'breeder']) {
  test(`${userType}: 가입 후 소셜 세션과 입력값이 없어도 완료 페이지를 유지함`, () => {
    assert.equal(
      getGuardRedirect({
        userType,
        requestedStep: 'complete',
        completedSteps: [],
        status: 'completed',
        hasValidSession: false,
      }),
      null,
    )
  })
  test(`${userType}: 가입 완료 후 입력 단계로 뒤로 가면 유형 선택 대신 완료 화면으로 이동함`, () => {
    assert.equal(
      getGuardRedirect({
        userType,
        requestedStep: 'profile',
        completedSteps: [],
        status: 'completed',
        hasValidSession: false,
      }),
      `/signup/${userType}/complete`,
    )
  })
}

test('홈 이동은 완료 상태를 지우지 않고 history replace로 진행함', () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../src/features/onboarding/ui/CompleteStep.tsx'),
    'utf8',
  )
  assert.match(source, /router\.replace\('\/'\)/)
  assert.doesNotMatch(source, /clearOnboarding|state\.clear|router\.push/)
})

test('토큰 저장 결과와 실제 쿠키를 확인한 뒤에만 로그인 상태 변경을 알림', async () => {
  const { saveAuthTokens } = load('src/shared/lib/saveAuthTokens.ts')
  const originalFetch = global.fetch
  const originalWindow = global.window
  const originalDocument = global.document
  const events = []
  global.window = { dispatchEvent: (event) => events.push(event.type) }
  global.document = { cookie: '' }
  try {
    global.fetch = async () => ({ ok: true })
    assert.equal(await saveAuthTokens({ accessToken: 'access', refreshToken: 'refresh' }), false)
    assert.equal(events.length, 0)
    global.document.cookie = 'accessToken=access'
    global.fetch = async () => ({ ok: false })
    assert.equal(await saveAuthTokens({ accessToken: 'access', refreshToken: 'refresh' }), false)
    assert.equal(events.length, 0)
    global.fetch = async () => ({ ok: true })
    assert.equal(await saveAuthTokens({ accessToken: 'access', refreshToken: 'refresh' }), true)
    assert.deepEqual(events, ['pawpong:auth-state-changed'])
    assert.equal(await saveAuthTokens({ accessToken: '', refreshToken: '' }), false)
  } finally {
    global.fetch = originalFetch
    if (originalWindow === undefined) delete global.window
    else global.window = originalWindow
    if (originalDocument === undefined) delete global.document
    else global.document = originalDocument
  }
})

test('이미 가입된 이메일(409)이면 응답 data 의 기존 가입 방법만 꺼내 그 제공자 로그인으로 보냄', () => {
  const { loadTypescript } = require('./helpers/load-typescript.cjs')
  const { ApiError } = loadTypescript('src/shared/api/unwrap.ts')
  const { existingProviderOf } = loadTypescript(
    'src/features/onboarding/model/existingProvider.ts',
    {
      '@/shared/api': { isApiError: (error) => error instanceof ApiError },
      '@/shared/lib/socialLogin': loadTypescript('src/shared/lib/socialLogin.ts', {
        '@/shared/config': { getApiBaseUrl: () => '' },
      }),
    },
  )
  // 백엔드 409 본문: { success, code, error, data: { errorCode, existingProvider } }
  const conflict = (data) =>
    new ApiError('이미 카카오 계정으로 가입되어 있어요.', 409, undefined, {
      success: false,
      code: 409,
      error: '이미 카카오 계정으로 가입되어 있어요.',
      data,
    })
  assert.equal(
    existingProviderOf(
      conflict({ errorCode: 'SOCIAL_PROVIDER_MISMATCH', existingProvider: 'kakao' }),
    ),
    'kakao',
  )
  // 버튼을 만들 수 없는 값·다른 오류는 문구만 보여 준다
  for (const error of [
    conflict({ errorCode: 'SOCIAL_PROVIDER_MISMATCH', existingProvider: 'local' }),
    conflict(undefined),
    new ApiError('잘못된 요청', 400, undefined, { data: { existingProvider: 'kakao' } }),
    new Error('network'),
  ]) {
    assert.equal(existingProviderOf(error), undefined)
  }
})

test('토큰 저장 요청에 제공자를 함께 실어 최근 사용 쿠키를 심게 함 (없으면 싣지 않음)', async () => {
  const { saveAuthTokens } = load('src/shared/lib/saveAuthTokens.ts')
  const originalFetch = global.fetch
  const originalWindow = global.window
  const originalDocument = global.document
  const bodies = []
  global.window = { dispatchEvent: () => {} }
  global.document = { cookie: 'accessToken=access' }
  global.fetch = async (_, init) => {
    bodies.push(JSON.parse(init.body))
    return { ok: true }
  }
  try {
    await saveAuthTokens({ accessToken: 'access', refreshToken: 'refresh', provider: 'kakao' })
    await saveAuthTokens({ accessToken: 'access', refreshToken: 'refresh' })
    assert.deepEqual(bodies, [
      { accessToken: 'access', refreshToken: 'refresh', provider: 'kakao' },
      { accessToken: 'access', refreshToken: 'refresh' },
    ])
  } finally {
    global.fetch = originalFetch
    if (originalWindow === undefined) delete global.window
    else global.window = originalWindow
    if (originalDocument === undefined) delete global.document
    else global.document = originalDocument
  }
})
