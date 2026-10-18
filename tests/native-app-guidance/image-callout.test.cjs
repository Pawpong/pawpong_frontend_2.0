const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

test('앱 안 이미지는 길게 눌러 저장하는 메뉴를 끄고 일반 브라우저에는 영향을 주지 않음', () => {
  const css = fs.readFileSync('src/app/globals.css', 'utf8')
  assert.match(css, /html\[data-native-viewport\] img \{\s*-webkit-touch-callout: none;\s*\}/)
  // 앱 표시 속성은 React Native WebView 안에서만 붙는다
  const bridge = fs.readFileSync('src/shared/lib/NativeViewportBridge.tsx', 'utf8')
  assert.match(bridge, /if \(cleanup \|\| !\(window as AppWindow\)\.ReactNativeWebView\) return/)
  assert.match(bridge, /root\.setAttribute\('data-native-viewport', ''\)/)
})
