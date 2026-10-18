const { test } = require('node:test')
const assert = require('node:assert/strict')
const { renderToStaticMarkup } = require('react-dom/server')
const { loadTypescript: load } = require('../helpers/load-typescript.cjs')
const { CommunityEditorExitDialog } = load(
  'src/app/(main)/community/_ui/CommunityEditorExitDialog.tsx',
  {
    '@/shared/ui': { CtaModal: () => null },
  },
)
const base = {
  open: true,
  isEdit: false,
  isSubmitting: false,
  configReady: true,
  canSaveDraft: true,
  error: null,
  onCancel() {},
  onDiscard() {},
  onSaveDraft() {},
}
test('저장 실패는 확인창 안에서 입력 보존과 재시도를 안내함', () => {
  const { props } = CommunityEditorExitDialog({ ...base, error: '연결을 확인해 주세요.' })
  const html = renderToStaticMarkup(props.description)
  assert.match(html, /role="alert"/)
  assert.match(html, /연결을 확인해 주세요/)
  assert.match(html, /입력한 내용은 남아 있어요/)
  assert.equal(props.actions[0].disabled, false)
})
test('저장 중에는 닫기와 취소 및 이탈 버튼을 모두 잠금', () => {
  let cancelled = 0
  const { props } = CommunityEditorExitDialog({
    ...base,
    isSubmitting: true,
    onCancel: () => cancelled++,
  })
  assert.equal(props.showClose, false)
  assert.equal(
    props.actions.every((action) => action.disabled),
    true,
  )
  props.onOpenChange(false)
  assert.equal(cancelled, 0)
})
test('설정 오류는 재확인을 안내하고 발행된 글을 초안으로 바꾸지 않음', () => {
  const failed = CommunityEditorExitDialog({
    ...base,
    configReady: false,
    canSaveDraft: false,
  }).props
  assert.match(renderToStaticMarkup(failed.description), /계속 작성하기를 눌러 다시 시도/)
  assert.equal(failed.actions[0].disabled, true)
  const edit = CommunityEditorExitDialog({ ...base, isEdit: true }).props
  assert.equal(
    edit.actions.some((action) => action.label === '임시저장 후 이동'),
    false,
  )
})
