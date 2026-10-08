const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

const read = (file) => fs.readFileSync(file, 'utf8')

test('터치 영역 확장은 손가락 입력 기기에서만 투명한 가상 요소로 44px을 채움', () => {
  const css = read('src/app/globals.css')
  const block = css.slice(
    css.indexOf('@utility touch-target'),
    css.indexOf('/* 썸네일·업로드 영역처럼'),
  )
  assert.match(block, /@media \(pointer: coarse\)/)
  assert.match(block, /width: max\(100%, 2\.75rem\);/)
  assert.match(block, /height: max\(100%, 2\.75rem\);/)
  assert.match(block, /transform: translate\(-50%, -50%\);/)
  // 배경·테두리·여백을 그리지 않아 보이는 디자인과 배치는 바뀌지 않는다
  assert.doesNotMatch(block, /background|border|box-shadow|margin|padding/)
})

test('공통 버튼·칩·아이콘 버튼·토글·글자 링크는 기준 위치와 함께 터치 영역을 가짐', () => {
  for (const file of [
    'src/shared/ui/Button.tsx',
    'src/shared/ui/Chip.tsx',
    'src/shared/ui/IconButton.tsx',
    'src/shared/ui/ToggleIconButton.tsx',
    'src/shared/ui/DetailLink.tsx',
  ])
    assert.match(read(file), /focus-ring touch-target relative /, file)
})

test('작은 닫기 버튼과 정렬 버튼과 로고 링크도 같은 터치 영역을 씀', () => {
  for (const file of [
    'src/shared/ui/CtaModal.tsx',
    'src/shared/ui/SortOptions.tsx',
    'src/widgets/gnb/ui/LogoButton.tsx',
  ]) {
    const code = read(file)
    assert.match(code, /touch-target/, file)
    assert.match(code, /\brelative\b/, file)
  }
})
