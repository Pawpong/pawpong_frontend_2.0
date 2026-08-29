import type { ImageEntry } from './useImageUpload'

/**
 * 표시 순서대로 최종 파일키 목록을 만든다.
 *
 * 이미 올라간 사진은 키를 그대로 쓰고, 새로 고른 사진만 업로드 결과에서 순서대로 꺼내 채운다.
 * 표시 순서가 대표 사진 인덱스의 기준이라 순서가 어긋나면 엉뚱한 사진이 대표가 된다.
 *
 * @param entries 화면에 걸린 사진들 (표시 순서)
 * @param uploadedFileNames `entries` 중 kind==='new' 인 것들을 같은 순서로 업로드한 결과
 */
export const composeImageKeys = (entries: ImageEntry[], uploadedFileNames: string[]): string[] => {
  const queue = [...uploadedFileNames]
  return entries.flatMap((entry) => {
    if (entry.kind === 'existing') return [entry.fileName]
    const uploaded = queue.shift()
    return uploaded ? [uploaded] : []
  })
}
