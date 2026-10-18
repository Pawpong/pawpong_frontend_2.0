const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript } = require('./helpers/load-typescript.cjs')
const { formatHallOfFamePeriod } = loadTypescript(
  'src/entities/community/model/hallOfFamePeriod.ts',
)

const round = {
  periodKey: '2026-10-2',
  startDate: '2026-10-10T15:00:00.000Z',
  endDate: '2026-10-20T15:00:00.000Z',
  refreshedAt: '2026-10-18T15:26:37.910Z',
  state: 'open',
  winners: [],
}

test('진행 중인 회차는 KST 기간과 집계 상태를 함께 표시함', () => {
  const period = formatHallOfFamePeriod(round)
  assert.equal(period.range, '10.11 ~ 10.20')
  assert.equal(period.summary, '10월 2회차 · 10.11 ~ 10.20 · 집계 중 (10.19 0시 기준)')
})

test('확정 회차는 집계 중으로 표시하지 않고 말일을 정확히 계산함', () => {
  const period = formatHallOfFamePeriod({
    ...round,
    periodKey: '2026-10-3',
    startDate: '2026-10-20T15:00:00.000Z',
    endDate: '2026-10-31T15:00:00.000Z',
    state: 'final',
  })
  assert.equal(period.summary, '10월 3회차 · 10.21 ~ 10.31')
})

test('아직 집계되지 않은 회차에 1970년 시각을 표시하지 않음', () => {
  assert.match(
    formatHallOfFamePeriod({ ...round, refreshedAt: new Date(0).toISOString() }).summary,
    /첫 집계 대기/,
  )
})
