const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

const source = ts.transpileModule(fs.readFileSync('src/shared/lib/pageErrorRecovery.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const recovery = {}
new Function('exports', source)(recovery)

test('stale deployment assets recover through a fresh document, including iOS module errors', () => {
  for (const error of [
    {
      name: 'ChunkLoadError',
      message: 'Loading chunk 123 failed. (missing: /_next/static/old.js)',
    },
    { name: 'Error', message: 'Loading CSS chunk 456 failed.' },
    {
      name: 'TypeError',
      message: 'Failed to fetch dynamically imported module: https://pawpong.kr/_next/old.js',
    },
    { name: 'TypeError', message: 'Importing a module script failed.' },
    {
      name: 'TypeError',
      message: 'error loading dynamically imported module: https://pawpong.kr/_next/old.js',
    },
  ]) {
    const calls = []
    recovery.recoverPageError(
      error,
      () => calls.push('reset'),
      () => calls.push('reload'),
    )
    assert.deepEqual(calls, ['reload'])
  }
})

test('ordinary application and API errors retain React retry instead of dropping the document', () => {
  for (const message of [
    'Failed to fetch',
    'Network Error',
    'Cannot read properties of undefined',
    '사진을 업로드하지 못했습니다.',
  ]) {
    const calls = []
    recovery.recoverPageError(
      new Error(message),
      () => calls.push('reset'),
      () => calls.push('reload'),
    )
    assert.deepEqual(calls, ['reset'])
  }
})
