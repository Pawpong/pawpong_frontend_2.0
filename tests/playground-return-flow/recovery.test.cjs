const { test } = require('node:test')
const assert = require('node:assert/strict')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { load } = require('./fixtures/navigation.fixture.cjs')
const { hooks, nodes } = require('../fixtures/pet-shop.fixture.cjs')

function recovery(runtime = React) {
  return load('src/app/(main)/community/_ui/CommunityPhotoRecovery.tsx', {
    react: runtime,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
    '@/shared/ui': {
      Button: (props) => React.createElement('button', props),
      buttonVariants: () => '',
    },
  }).CommunityPhotoRecovery
}

test('만료된 사진 전달은 원래 입력을 지우지 않고 올바른 재선택 경로를 안내함', () => {
  for (const [source, href, label] of [
    ['ai-photo', '/home?tab=ai-photos', 'AI 보관함에서 고르기'],
    ['memory-card', '/playground/memory-card', '추억 카드 다시 만들기'],
  ]) {
    const html = renderToStaticMarkup(React.createElement(recovery(), { source }))
    assert.match(html, /사진을 다시 선택해 주세요/)
    assert.ok(html.includes(`href="${href}"`))
    assert.ok(html.includes(label))
    assert.match(html, /사진 없이 계속 쓰기/)
  }
})

test('사진 없이 계속 쓰기는 이동이나 저장 없이 안내만 닫음', () => {
  const runtime = hooks()
  const Component = recovery(runtime.react)
  const render = () => runtime.render(() => Component({ source: 'ai-photo' }))
  const button = nodes(render()).find((node) => node.props?.children === '사진 없이 계속 쓰기')
  button.props.onClick()
  assert.equal(render(), null)
})
