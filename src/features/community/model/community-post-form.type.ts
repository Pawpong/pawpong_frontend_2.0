import type {
  CommunityAiComparison,
  CommunityExperience,
  CommunityPetType,
  CommunityPostStatus,
  CommunityPostVisibility,
} from '@/shared/types'

export interface CommunityPostFormInput {
  experience?: CommunityExperience | null
  aiComparison?: CommunityAiComparison | null
  aiReviewConsent?: boolean
  text: string
  files: File[]
  visibility: CommunityPostVisibility
  status: CommunityPostStatus
  petType?: CommunityPetType | null
  keptImageUrls?: string[]
}
