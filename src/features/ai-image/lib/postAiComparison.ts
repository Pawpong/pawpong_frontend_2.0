import type { CommunityAiComparison } from '@/shared/types'

export type ComparisonPhoto = string | File
export interface PostAiComparisonChoice {
  enabled: boolean
  before: ComparisonPhoto | null
  after: ComparisonPhoto | null
  /** 비교용으로 고른 원본들은 해제·교체 후 일반 갤러리로 새지 않게 분리한다. */
  sources: ComparisonPhoto[]
  privateBefore: boolean
}

export function prepareComparisonPost(photos: ComparisonPhoto[], choice: PostAiComparisonChoice) {
  const before =
    choice.privateBefore || photos.includes(choice.before as ComparisonPhoto) ? choice.before : null
  const after = photos.includes(choice.after as ComparisonPhoto) ? choice.after : null
  const validPair = !!before && !!after && before !== after && !choice.sources.includes(after)
  const publish = photos.filter((photo) => !choice.sources.includes(photo))
  if (choice.enabled && validPair && !publish.includes(before)) publish.push(before)
  // 업로드 API는 기존 URL 다음에 새 File을 붙이므로 그 순서로 비교 인덱스를 계산한다.
  const keptImageUrls = publish.filter((photo): photo is string => typeof photo === 'string')
  const files = publish.filter((photo): photo is File => typeof photo !== 'string')
  const ordered: ComparisonPhoto[] = [...keptImageUrls, ...files]
  const aiComparison: CommunityAiComparison | null =
    choice.enabled && validPair
      ? { beforePhotoIndex: ordered.indexOf(before), afterPhotoIndex: ordered.indexOf(after) }
      : null
  const error =
    choice.enabled && !validPair
      ? '비교할 AI 사진과 원본을 골라 주세요.'
      : ordered.length > 10
        ? '원본까지 사진 10장 이하로 맞춰 주세요.'
        : null
  return { files, keptImageUrls, aiComparison, error, before, after }
}
