const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { loadTypescript: load } = require('../helpers/load-typescript.cjs')

test('위치 권한 거부 안내는 앱에서는 휴대폰 설정, 웹에서는 브라우저 설정을 가리킴', () => {
  const care = load('src/features/care-map/lib/care-location.ts')
  const careFor = (inApp) => care.careLocationFailureMessage('denied', inApp)
  assert.match(careFor(true), /휴대폰 설정에서 포퐁 앱의 위치 권한/)
  assert.match(careFor(false), /브라우저에서 위치 권한/)
  assert.equal(care.careLocationFailureMessage('denied'), careFor(false))
  const map = fs.readFileSync('src/features/care-map/ui/CareMapContent.tsx', 'utf8')
  assert.equal(
    (map.match(/careLocationFailureMessage\(reason, inNativeAppWebView\(\)\)/g) ?? []).length,
    2,
  )
  const chat = fs.readFileSync('src/app/(main)/chat/_ui/ChatMessageInput.tsx', 'utf8')
  assert.match(
    chat,
    /inNativeAppWebView\(\)\s*\?\s*'위치 권한이 꺼져 있습니다\. 휴대폰 설정에서 포퐁 앱의 위치 권한을 허용해주세요\.'/,
  )
})
