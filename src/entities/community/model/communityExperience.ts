export interface CommunityExperienceConfig {
  enabled: boolean
  aiEnabled: boolean
  topics: Array<{ key: string; label: string }>
  aiNotice: string
}
export const CLOSED_COMMUNITY_EXPERIENCE: CommunityExperienceConfig = {
  enabled: false,
  aiEnabled: false,
  topics: [],
  aiNotice: '',
}
/** 백엔드 설정 응답의 data — 꺼져 있으면 닫힌 설정, 켜져 있는데 모양이 틀리면 null */
export const parseCommunityExperienceConfig = (
  data: Partial<CommunityExperienceConfig> | null | undefined,
): CommunityExperienceConfig | null => {
  if (data?.enabled !== true) return CLOSED_COMMUNITY_EXPERIENCE
  const { aiEnabled, aiNotice, topics } = data
  if (
    typeof aiEnabled !== 'boolean' ||
    typeof aiNotice !== 'string' ||
    !Array.isArray(topics) ||
    !topics.every(
      (topic: { key?: unknown; label?: unknown } | null) =>
        topic && typeof topic.key === 'string' && typeof topic.label === 'string',
    )
  )
    return null
  return { enabled: true, aiEnabled, aiNotice, topics }
}
export interface CommunityAiAnswer {
  status: 'pending' | 'completed' | 'failed'
  answer: string | null
  needsVet: boolean
  createdAt: string
  aiGenerated: true
}
