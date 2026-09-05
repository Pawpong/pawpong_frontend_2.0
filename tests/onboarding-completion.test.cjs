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
