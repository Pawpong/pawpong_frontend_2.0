import type {
  CommunityAiComparison,
  CommunityExperience,
  CommunityPetType,
  CommunityPostStatus,
  CommunityPostVisibility,
} from '@/shared/types'
import type { CommunityCreateAttempt } from '../lib/communityCreateAttempt'

export interface CommunityPostFormInput {
  experience?: CommunityExperience | null
  aiComparison?: CommunityAiComparison | null
  aiReviewConsent?: boolean
  useOwnedPhotoUpload?: boolean
  /** 새 글 발행의 재시도 묶음. 올린 사진 파일명을 여기에 적어 재시도에서 다시 쓴다 */
  createAttempt?: CommunityCreateAttempt
  text: string
  files: File[]
  visibility: CommunityPostVisibility
  status: CommunityPostStatus
  petType?: CommunityPetType | null
  keptImageUrls?: string[]
}
