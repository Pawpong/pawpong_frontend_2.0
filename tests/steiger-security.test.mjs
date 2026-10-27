import assert from 'node:assert/strict'
import test from 'node:test'
import { processConfiguration } from 'steiger'
import projectConfig from '../steiger.config.ts'

function configuration(check = () => ({ diagnostics: [] }), rules = { 'fixture/first': 'warn' }) {
  return [
    {
      meta: { name: 'fixture', version: '1.0.0' },
      ruleDefinitions: [
        { name: 'fixture/first', check },
        { name: 'fixture/second', check: () => ({ diagnostics: [] }) },
      ],
    },
    { rules },
  ]
}

test('Zod 보안 패치 후 기존 프로젝트 FSD 설정을 읽는다', () => {
  assert.doesNotThrow(() => processConfiguration(projectConfig, process.cwd()))
})

test('전체 규칙을 나열하지 않아도 일부 규칙만 설정할 수 있다', () => {
  const parsed = processConfiguration(configuration(), process.cwd())
  assert.deepEqual(parsed[1].rules, { 'fixture/first': 'warn' })
})

test('없는 규칙과 잘못된 심각도 및 함수가 아닌 검사기를 거부한다', () => {
  for (const rules of [{ 'fixture/missing': 'warn' }, { 'fixture/first': 'invalid' }]) {
    assert.throws(() => processConfiguration(configuration(undefined, rules), process.cwd()))
  }
  assert.throws(() => processConfiguration(configuration('not-a-function'), process.cwd()))
})

test('동기 검사기의 인수와 this 및 결과 검증을 유지한다', () => {
  const root = { type: 'folder', path: '/fixture', children: [] }
  const options = { enabled: true }
  const context = { expected: true }
  const [plugin] = processConfiguration(
    configuration(function (actualRoot, actualOptions) {
      assert.equal(this, context)
      assert.equal(actualRoot, root)
      assert.equal(actualOptions, options)
      return { diagnostics: [] }
    }),
    process.cwd(),
  )
  assert.deepEqual(plugin.ruleDefinitions[0].check.call(context, root, options), {
    diagnostics: [],
  })
  const [invalid] = processConfiguration(
    configuration(() => ({ diagnostics: 'invalid' })),
    process.cwd(),
  )
  assert.throws(() => invalid.ruleDefinitions[0].check())
})

test('비동기 검사기의 결과 검증과 거부된 Promise를 유지한다', async () => {
  const [valid] = processConfiguration(
    configuration(async () => ({ diagnostics: [] })),
    process.cwd(),
  )
  assert.deepEqual(await valid.ruleDefinitions[0].check(), { diagnostics: [] })
  const [invalid] = processConfiguration(
    configuration(async () => ({ diagnostics: 'invalid' })),
    process.cwd(),
  )
  await assert.rejects(invalid.ruleDefinitions[0].check())
  const failure = new Error('검사 실패')
  const [rejected] = processConfiguration(
    configuration(async () => {
      throw failure
    }),
    process.cwd(),
  )
  await assert.rejects(rejected.ruleDefinitions[0].check(), (error) => error === failure)
})
