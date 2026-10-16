const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript: load } = require('./helpers/load-typescript.cjs')
const { isBrowserExtensionOnlyError: isExtension } = load('sentry.browser.ts')

const message = "Cannot read properties of undefined (reading 'M_ID')"
const event = {
  exception: {
    values: [
      {
        type: 'TypeError',
        value: message,
        stacktrace: { frames: [{ filename: 'app:///executors/200.js' }] },
      },
    ],
  },
}
const hint = (...frames) => ({
  originalException: { stack: `TypeError: ${message}\n${frames.join('\n')}` },
})

test('actual SDK parser identifies extension-only original frames even after app:/// normalization', () => {
  for (const protocol of ['chrome-extension', 'moz-extension', 'safari-web-extension']) {
    assert.equal(
      isExtension(
        event,
        hint(
          `    at Y (${protocol}://example/executors/200.js:1:761)`,
          `    at XMLHttpRequest.onreadystatechange (${protocol}://example/executors/200.js:1:2598)`,
        ),
      ),
      true,
    )
  }
})

test('same M_ID message from app code and mixed extension/app stacks are always retained', () => {
  const appFrame = '    at render (https://pawpong.kr/_next/static/chunks/app.js:1:761)'
  const extensionFrame = '    at Y (chrome-extension://example/executors/200.js:1:761)'
  for (const frames of [[appFrame], [appFrame, extensionFrame], [extensionFrame, appFrame]]) {
    assert.equal(isExtension(event, hint(...frames)), false)
  }
  assert.equal(
    isExtension(event, hint('    at Y (https://pawpong.kr/executors/200.js:1:761)')),
    false,
  )
})

test('missing original stack, unknown frames and chained errors remain observable', () => {
  for (const input of [{}, { originalException: message }, hint('unknown frame'), hint()]) {
    assert.equal(isExtension(event, input), false)
  }
  const extension = hint('    at Y (chrome-extension://example/executors/200.js:1:761)')
  assert.equal(
    isExtension(
      { exception: { values: [...event.exception.values, { type: 'Error', value: 'app cause' }] } },
      extension,
    ),
    false,
  )
  assert.equal(isExtension({ message: 'plain capture' }, extension), false)
})
