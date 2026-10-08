const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

test('기다리는 돌봄 버튼도 키보드로 닿아 남은 시간을 읽고 눌러도 요청하지 않음', () => {
  const room = fs.readFileSync('src/features/playground-pet/ui/PetRoom.tsx', 'utf8')
  const css = fs.readFileSync('src/features/playground-pet/ui/PetRoom.module.css', 'utf8')
  assert.match(room, /aria-disabled=\{blocked\}/)
  assert.match(room, /if \(!blocked\) onAction\(action\)/)
  assert.doesNotMatch(room, /disabled=\{disabled \|\| Boolean\(active\) \|\| !availability\?\.allowed\}/)
  assert.match(css, /\.careButton\[aria-disabled='true'\] \{\s*cursor: default;\s*opacity: 0\.55;/)
})
