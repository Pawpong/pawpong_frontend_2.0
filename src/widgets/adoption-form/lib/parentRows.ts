import type { FieldArrayWithId } from 'react-hook-form'
import type { AdoptionCreateFormValues } from './schema'

/**
 * 부모 행 목록 + 행별 사진 번들 — ParentInfoSection 이 그대로 소비한다.
 * 작성·수정 훅이 각자 이 형태로 만들어 넘긴다. 훅에서 파생시키면 위젯이 라우트를
 * 거슬러 참조하게 되므로(widgets -> app 금지) 여기서 형태를 명시한다.
 */
export interface ParentRows {
  fields: FieldArrayWithId<AdoptionCreateFormValues, 'parents'>[]
  append: () => void
  remove: (index: number) => void
  imagesOf: (rowId: string) => string[]
  addImage: (rowId: string, files: FileList) => void
  removeImage: (rowId: string) => void
}
