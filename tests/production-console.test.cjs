const { test } = require('node:test')
const assert = require('node:assert/strict')
const vm = require('node:vm')
const loader = require('../scripts/remove-vendor-console.cjs')

function compile(source, resourcePath = 'node_modules/phaser/example.js') {
  let result
  loader.call(
    {
      resourcePath,
      callback(error, code, map) {
        assert.equal(error, null)
        assert.ok(map.sources.length > 0)
        result = code
      },
    },
    source,
  )
  return result
}

test('라이브러리 직접 호출과 bind/apply 별칭 로그만 제거하고 인자 평가와 경고를 보존함', () => {
  const calls = []
  const sandbox = {
    console: Object.fromEntries(
      ['log', 'info', 'debug', 'warn', 'error'].map((method) => [
        method,
        (text) => calls.push([method, text]),
      ]),
    ),
    seen: 0,
  }
  vm.runInNewContext(
    compile(`
      console.log(++seen);
      console.log.apply(console, ['apply']);
      const print = console.info.bind(console); print('bound');
      const debug = console.debug; debug('alias');
      console.warn('warn'); console.error('error');
      globalThis.literal = 'console.log(문자열은 보존)';
    `),
    sandbox,
  )
  assert.equal(sandbox.seen, 1)
  assert.equal(sandbox.literal, 'console.log(문자열은 보존)')
  assert.deepEqual(calls, [
    ['warn', 'warn'],
    ['error', 'error'],
  ])
})

test('HEIC 내장 Worker 문자열도 변환하며 다른 문자열은 실행 코드로 취급하지 않음', () => {
  const worker = '(()=>{console.log("worker");console.warn("warning")})()'
  const source = `globalThis.worker = ${JSON.stringify(worker)};`
  const sandbox = {}
  vm.runInNewContext(compile(source, 'node_modules/heic-to/dist/csp/heic-to.js'), sandbox)
  assert.doesNotMatch(sandbox.worker, /console\.log/)
  const warnings = []
  vm.runInNewContext(sandbox.worker, {
    console: { warn: (text) => warnings.push(text), log: () => assert.fail('로그 출력') },
  })
  assert.deepEqual(warnings, ['warning'])
  const untouched = {}
  vm.runInNewContext(compile(source), untouched)
  assert.equal(untouched.worker, worker)
})
