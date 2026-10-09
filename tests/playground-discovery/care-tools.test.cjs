const { test } = require('node:test')
const assert = require('node:assert/strict')
const { renderToStaticMarkup } = require('react-dom/server')
const { createElement } = require('react')
const { loadTypescript } = require('../helpers/load-typescript.cjs')
const { source } = require('./fixtures/discovery.fixture.cjs')

const ui = 'src/features/playground-tools/ui'

test('외출 준비함은 초록 CHECK LIST 티켓에 도트 진행 바를 쓰고 다 챙기면 알림 영역에 축하가 들어옴', () => {
  const checklist = source(`${ui}/OutingChecklist.tsx`)
  assert.match(checklist, /data-accent="green" className=\{ticketStyles\.ticket\}/)
  assert.match(checklist, /<TicketStrip label="CHECK LIST"/)
  assert.match(
    checklist,
    /<PixelProgressBar percent=\{percent\} label=\{`외출 준비 진행률 \$\{percent\}%`\}/,
  )
  assert.doesNotMatch(checklist, /<progress\b/)
  // 알림 영역은 늘 두고 내용만 바꿔야 화면 낭독기가 축하 문구를 읽는다.
  assert.match(checklist, /<div role="status">\s*\{allDone && \(/)
  // 돌아온 뒤 남길 기록도 놀이터 돌봄 도구와 같은 라벨의 티켓으로 잇는다.
  for (const label of ['WALK NOTE', 'DAILY NOTE', 'TRIP NOTE', 'CLINIC NOTE'])
    assert.ok(checklist.includes(`'${label}'`), label)
  assert.match(checklist, /label=\{NOTE_LABEL\[data\.selected\]\}/)
})

test('외출 준비함의 체크·목적 고르기 연출은 움직임 줄이기에서 멈추고 지운 줄도 4.5:1 이상으로 읽힘', () => {
  const css = source(`${ui}/Tools.module.css`)
  assert.match(
    css,
    /\.checkedRow label span \{\s*text-decoration: line-through;[\s\S]*?color: var\(--color-neutral-700, #6b6b6b\);/,
  )
  assert.match(css, /\.checklist small \{[\s\S]*?color: var\(--color-neutral-700, #6b6b6b\);/)
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'))
  for (const selector of [
    ".purpose[aria-pressed='true']",
    '.checklist input:checked',
    '.checkedRow',
    '.success',
    '.confetti',
  ])
    assert.ok(reduced.includes(selector), selector)
})

test('산책·병원 기록 링크로 들어온 새 글은 놀이터와 같은 티켓 머리를 쓰고 수정 글은 기본 머리를 씀', () => {
  const { communityRecordIntro } = loadTypescript(
    'src/app/(main)/community/_ui/communityRecordIntro.tsx',
    {
      '@/shared/assets': {
        LocationPinIcon: () => null,
        PawPrintIcon: () => null,
        PixelPencilIcon: () => null,
      },
    },
  )
  assert.equal(communityRecordIntro('walk').label, 'WALK NOTE')
  assert.equal(communityRecordIntro('walk').title, '산책 기록 남기기')
  assert.equal(communityRecordIntro('clinic').label, 'CLINIC NOTE')
  assert.match(communityRecordIntro('clinic').description, /진료기록 사진은 올리지/)
  for (const value of [undefined, 'question', '__proto__', 'toString'])
    assert.equal(communityRecordIntro(value), null, String(value))

  const editor = source('src/app/(main)/community/_ui/CommunityPostEditor.tsx')
  assert.match(editor, /const recordIntro = post \? null : communityRecordIntro\(initialRecord\)/)
  assert.match(editor, /introTicket=\{recordIntro \?\? undefined\}/)

  const cn = (...values) => values.filter(Boolean).join(' ')
  const { ComposerLayout } = loadTypescript('src/shared/ui/ComposerLayout.tsx', {
    '@/shared/assets': { PawPrintIcon: () => null },
    './Container': { Container: ({ children }) => createElement('div', {}, children) },
    './NavigationBar': { NavigationBar: () => null },
    './Ticket': {
      ticketStyles: { ticket: 'ticket' },
      TicketStrip: ({ label }) => createElement('span', { className: 'strip' }, label),
    },
    '@/shared/lib/cn': { cn },
  })
  const html = renderToStaticMarkup(
    createElement(
      ComposerLayout,
      {
        title: '글 작성',
        introTitle: '산책 기록 남기기',
        description: '걸은 길을 남겨요.',
        introTicket: { label: 'WALK NOTE', accent: 'green' },
        onBack: () => {},
      },
      createElement('form'),
    ),
  )
  assert.match(
    html,
    /<header data-accent="green" class="ticket mb-6 tab:mb-8"><span class="strip">WALK NOTE<\/span><div[^>]*><h1[^>]*>산책 기록 남기기<\/h1>/,
  )
  const plain = renderToStaticMarkup(
    createElement(
      ComposerLayout,
      {
        title: '글 작성',
        introTitle: '우리 아이의 일상을 나눠주세요',
        description: '설명',
        onBack: () => {},
      },
      createElement('form'),
    ),
  )
  assert.doesNotMatch(plain, /data-accent/)
  assert.match(plain, /우리 아이의 일상을 나눠주세요/)
})

test('고른 선택 카드·기록 칩의 작은 설명은 옅은 배경 위에서도 4.5:1 이상인 색을 씀', () => {
  assert.match(
    source('src/shared/ui/RadioCardGroup.tsx'),
    /value === option\.value \? 'text-neutral-800' : 'text-neutral-700'/,
  )
  assert.match(
    source('src/app/(main)/community/_ui/CommunityExperienceEditor.tsx'),
    /selected \? 'text-neutral-800' : 'text-neutral-700'/,
  )
})
