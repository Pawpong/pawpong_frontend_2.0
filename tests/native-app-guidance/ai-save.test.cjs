const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { loadTypescript: load } = require('../helpers/load-typescript.cjs')

// 앱 WebView 여부만 바꿔 가며 공용 판별 함수를 불러온다.
function bridge(windowValue) {
  return load('src/shared/lib/nativeBridge.ts', {}, { window: windowValue })
}

function saver({ inApp, canShare = false }) {
  const clicks = []
  const nativeBridge = { inNativeAppWebView: () => inApp }
  const module = load(
    'src/features/ai-image/lib/aiImageFile.ts',
    { '@/entities/ai-image': {}, '@/shared/lib/nativeBridge': nativeBridge },
    {
      navigator: { canShare: () => canShare, share: async () => {} },
      document: {
        createElement: () => ({
          click() {
            clicks.push(this.download)
          },
        }),
      },
      URL: { createObjectURL: () => 'blob:합성', revokeObjectURL() {} },
      setTimeout: () => 0,
    },
  )
  return { module, clicks }
}

test('앱 화면 판별은 브리지 객체나 앱 준비 신호가 있을 때만 참임', () => {
  assert.equal(bridge({}).inNativeAppWebView(), false)
  assert.equal(bridge({ ReactNativeWebView: { postMessage() {} } }).inNativeAppWebView(), true)
  assert.equal(bridge({ __PAWPONG_APP__: { platform: 'android' } }).inNativeAppWebView(), true)
})

test('앱에서 파일 공유를 지원하지 않으면 조용히 실패하는 내려받기 대신 저장 미지원을 알림', async () => {
  const file = new File(['합성'], 'pawpong.png', { type: 'image/png' })
  const app = saver({ inApp: true })
  await assert.rejects(app.module.saveAiImageFile(file), (error) => {
    assert.equal(error.name, app.module.AI_IMAGE_SAVE_UNSUPPORTED)
    assert.match(error.message, /이 앱에서는 사진 저장을 아직 지원하지 않아요/)
    return true
  })
  assert.deepEqual(app.clicks, [])
  const web = saver({ inApp: false })
  await web.module.saveAiImageFile(file)
  assert.deepEqual(web.clicks, ['pawpong.png'])
  const sharing = saver({ inApp: true, canShare: true })
  await sharing.module.saveAiImageFile(file)
  assert.deepEqual(sharing.clicks, [])
})

test('AI 사진 화면과 보관함은 저장 미지원을 일반 실패와 구분해 안내함', () => {
  for (const file of [
    'src/features/ai-image/ui/AiFilterStudio.tsx',
    'src/features/ai-image/lib/useAiArchiveAction.ts',
  ]) {
    const code = fs.readFileSync(file, 'utf8')
    assert.match(code, /\.name === AI_IMAGE_SAVE_UNSUPPORTED/, file)
    assert.match(code, /AI_IMAGE_SAVE_UNSUPPORTED_MESSAGE/, file)
  }
})
