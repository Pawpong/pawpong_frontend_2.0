import { getAiImageGenerationImage } from '@/entities/ai-image'

/** 결과 PNG 를 사진 파일로 받는다 (버킷 CORS 가 없어 API 로 받는다) */
export const fetchAiImageFile = async (jobId: string, name = `pawpong-${jobId}.png`) =>
  new File([await getAiImageGenerationImage(jobId)], name, { type: 'image/png' })

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
  const url = URL.createObjectURL(file)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = file.name
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
