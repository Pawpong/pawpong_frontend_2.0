const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const source = ts.transpileModule(fs.readFileSync('src/shared/config/apiBaseUrl.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText
const output = {}
new Function('exports', source)(output)
const { resolveApiBaseUrl } = output

test('Android emulator rewrites only a local HTTP API during development', () => {
  assert.equal(resolveApiBaseUrl('http://localhost:8080/', true, '10.0.2.2'), 'http://10.0.2.2:8080')
  assert.equal(resolveApiBaseUrl('http://127.0.0.1:8080/api/', true, '10.0.2.2'), 'http://10.0.2.2:8080/api')
  for (const base of ['https://api.pawpong.kr', 'https://dev-api.pawpong.kr', '/api', '']) {
    assert.equal(resolveApiBaseUrl(base, true, '10.0.2.2'), base)
  }
})

test('production, server rendering and desktop retain the configured URL', () => {
  for (const [dev, host] of [[false, '10.0.2.2'], [true, undefined], [true, 'localhost']]) {
    assert.equal(resolveApiBaseUrl('http://localhost:8080', dev, host), 'http://localhost:8080')
  }
})
