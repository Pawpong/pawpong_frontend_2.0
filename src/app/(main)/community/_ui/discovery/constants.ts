import type { CommunityRecordKind } from '@/shared/types'

export const KIND_LABELS = { question: '질문', story: '경험·후기' } as const
export const MEDIA_LABELS = { photos: '사진', map: '산책 코스·장소' } as const
export const PERIOD_LABELS = { week: '최근 7일', month: '최근 30일' } as const
export const RECORD_KINDS: CommunityRecordKind[] = ['walk', 'clinic', 'life']
