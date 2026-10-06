export interface CommunityExperienceConfig {
  enabled: boolean
  aiEnabled: boolean
  topics: Array<{ key: string; label: string }>
  aiNotice: string
}
export interface CommunityAiAnswer {
  status: 'pending' | 'completed' | 'failed'
  answer: string | null
  needsVet: boolean
  createdAt: string
  aiGenerated: true
}
