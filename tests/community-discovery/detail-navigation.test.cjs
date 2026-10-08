const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createElement } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { loadTypescript: load } = require('../helpers/load-typescript.cjs')

test('모바일 상세도 목록을 새로 불러오지 않고 닫을 때 이전 화면으로 돌아간다', () => {
  let properties,
    backs = 0
  const { PostDetailModal } = load(
    'src/app/(main)/community/@modal/(.)post/[postId]/_ui/PostDetailModal.tsx',
    {
      'next/navigation': { useRouter: () => ({ back: () => backs++ }) },
      '../../../../_ui/PostDetailDialog': {
        PostDetailDialog: (props) => {
          properties = props
          return null
        },
      },
    },
  )
  renderToStaticMarkup(createElement(PostDetailModal, { postId: '합성 글' }))
  assert.equal(properties.mobileFullScreen, true)
  assert.equal(properties.postId, '합성 글')
  properties.onOpenChange(true)
  assert.equal(backs, 0)
  properties.onOpenChange(false)
  assert.equal(backs, 1)
})
