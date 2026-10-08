const { test } = require('node:test')
const assert = require('node:assert/strict')
const { hooks, decorations, gameFixture, nodes } = require('./fixtures/shop.fixture.cjs')

function dialog(patch = {}) {
  const runtime = hooks()
  const { PetPurchaseDialog } = decorations(runtime.react)
  let closed = 0,
    confirmed = 0
  const props = {
    item: gameFixture().catalog.find((item) => item.id === 'toy_bone'),
    open: true,
    stars: 20,
    disabled: false,
    pending: false,
    onClose() {
      closed++
    },
    onConfirm() {
      confirmed++
    },
    ...patch,
  }
  const tree = nodes(runtime.render(() => PetPurchaseDialog(props)))
  return { tree, closed: () => closed, confirmed: () => confirmed }
}

test('구매 처리 중 Escape를 눌러도 확인 창을 닫거나 구매를 다시 보내지 않음', () => {
  const h = dialog({ pending: true, disabled: true })
  let prevented = false
  h.tree
    .find((node) => node.type === 'dialog')
    .props.onCancel({
      preventDefault() {
        prevented = true
      },
    })
  assert.equal(prevented, true)
  assert.equal(h.closed(), 0)
  assert.equal(h.confirmed(), 0)
  assert.ok(h.tree.filter((node) => node.type === 'button').every((node) => node.props.disabled))
})

test('구매 조건이 바뀌어 구매할 수 없더라도 처리 중이 아니면 확인 창을 닫을 수 있음', () => {
  const h = dialog({ disabled: true })
  const close = h.tree.find((node) => node.type === 'button' && node.props.children === '닫기')
  assert.equal(close.props.disabled, false)
  close.props.onClick()
  assert.equal(h.closed(), 1)
})

test('구매 창의 첫 포커스는 닫기에 두고 확인 전에는 별사탕을 사용하지 않음', () => {
  const h = dialog()
  const focused = h.tree.find((node) => node.type === 'button' && node.props.autoFocus)
  assert.equal(focused.props.children, '닫기')
  assert.equal(h.confirmed(), 0)
})

test('구매 중에는 진행 상태를 창 안에서 알리고 설명과 연결함', () => {
  const h = dialog({ pending: true, disabled: true })
  const root = h.tree.find((node) => node.type === 'dialog')
  assert.equal(root.props['aria-busy'], true)
  assert.equal(root.props['aria-describedby'], 'pet-purchase-description')
  assert.ok(h.tree.some((node) => node.props.role === 'status'))
})

test('숨겨진 구매 창을 실제로 연 뒤 닫기 버튼으로 포커스를 옮기고 재렌더링에는 반복하지 않음', () => {
  const runtime = hooks(),
    effects = [],
    calls = []
  const { PetPurchaseDialog } = decorations({
    ...runtime.react,
    useEffect: (effect) => effects.push(effect),
  })
  const tree = nodes(
    runtime.render(() =>
      PetPurchaseDialog({
        item: gameFixture().catalog[6],
        open: true,
        stars: 20,
        disabled: false,
        pending: false,
        onClose() {},
        onConfirm() {},
      }),
    ),
  )
  const element = {
    open: false,
    showModal() {
      this.open = true
      calls.push('열림')
    },
  }
  tree.find((node) => node.type === 'dialog').props.ref.current = element
  tree.find((node) => node.type === 'button' && node.props.children === '닫기').props.ref.current =
    {
      focus() {
        assert.equal(element.open, true)
        calls.push('닫기로 이동')
      },
    }
  effects[0]()
  effects[0]()
  assert.deepEqual(calls, ['열림', '닫기로 이동'])
})
