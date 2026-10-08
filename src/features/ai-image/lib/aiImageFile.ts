import { getAiImageGenerationImage, getAiImageGenerationSourceImage } from '@/entities/ai-image'
import { inNativeAppWebView } from '@/shared/lib/nativeBridge'

/** 앱 WebView는 파일 내려받기를 처리하지 않아 저장이 조용히 실패한다. 호출부가 안내할 수 있게 구분한다. */
export const AI_IMAGE_SAVE_UNSUPPORTED = 'AiImageSaveUnsupported'
export const AI_IMAGE_SAVE_UNSUPPORTED_MESSAGE =
  '이 앱에서는 사진 저장을 아직 지원하지 않아요. 커뮤니티에 올리거나 웹 브라우저에서 저장해 주세요.'

/** 결과 PNG 를 사진 파일로 받는다 (버킷 CORS 가 없어 API 로 받는다) */
export const fetchAiImageFile = async (
  jobId: string,
  name = `pawpong-${jobId}.png`,
  signal?: AbortSignal,
) => new File([await getAiImageGenerationImage(jobId, { signal })], name, { type: 'image/png' })

/**
 * 폰 앨범에 저장하기.
 * 공유 시트가 파일을 받을 수 있으면(모바일·앱 웹뷰) 그걸로 저장·공유하고, 아니면 파일로 내려받는다.
 * 사용자가 공유 시트를 닫은 것은 실패가 아니므로 조용히 끝낸다.
 */
export const saveAiImageFile = async (file: File) => {
  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '포퐁 AI 필터' })
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }
  if (inNativeAppWebView())
    throw Object.assign(new Error(AI_IMAGE_SAVE_UNSUPPORTED_MESSAGE), {
      name: AI_IMAGE_SAVE_UNSUPPORTED,
    })
  const url = URL.createObjectURL(file)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = file.name
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 본인이 비교 공개를 선택했을 때만 인증한 원본을 받는다. */
export const fetchAiSourceFile = async (jobId: string, signal?: AbortSignal) => {
  const blob = await getAiImageGenerationSourceImage(jobId, signal)
  const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/jpeg' ? 'jpg' : 'png'
  return new File([blob], `pawpong-${jobId}-original.${ext}`, { type: blob.type || 'image/png' })
}
