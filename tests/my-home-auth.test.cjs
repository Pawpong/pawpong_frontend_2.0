const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

function load(file, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText
  const output = {}
  new Function('exports', 'require', code)(output, (name) => dependencies[name] ?? require(name))
  return output
}

test('마이홈은 화면을 그리기 전에 서버에서 로그인을 확인하고 돌아올 탭을 함께 넘긴다', async () => {
  const returnUrls = []
  const page = load('src/app/(main)/home/page.tsx', {
    '@/shared/lib/metadata': { createPageMetadata: () => ({}) },
    '@/features/auth/server': {
      requireAuth: async (returnUrl) => {
        returnUrls.push(returnUrl)
        return 'adopter'
      },
    },
    './_ui/MyHomeContent': { MyHomeContent: () => null },
  })
  await page.default({ searchParams: Promise.resolve({}) })
  await page.default({ searchParams: Promise.resolve({ tab: 'activity' }) })
  await page.default({ searchParams: Promise.resolve({ tab: ['ai-photos', 'posts'] }) })
  assert.deepEqual(returnUrls, ['/home', '/home?tab=activity', '/home?tab=ai-photos'])
})
