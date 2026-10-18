export const LEVEL_FAMILIES = [
  { key: 'first_meeting', name: '첫 만남' },
  { key: 'best_friend', name: '단짝' },
  { key: 'blooming_day', name: '꽃피는 날' },
  { key: 'four_seasons', name: '사계절' },
  { key: 'starlight', name: '별빛 동행' },
  { key: 'lifetime', name: '한평생' },
] as const
export const LEVEL_NOTICE =
  '포퐁 안에서 쌓은 활동을 보여주는 단계예요. 브리더 자격이나 아이의 건강을 보증하지 않아요.'
export interface ActivityLevel {
  value: number
  family: (typeof LEVEL_FAMILIES)[number]['key']
  nextValue: number | null
  nextExp: number | null
}
export type BreederLevel = Pick<ActivityLevel, 'value' | 'family'>
export interface ActivityCatalog {
  levels: Array<{ value: number; exp: number; family: ActivityLevel['family'] }>
  families: Array<{ key: ActivityLevel['family']; name: string }>
  rules: Record<string, { exp: number; daily?: number; monthly?: number; once?: boolean }>
}
export const ACTIVITY_LABELS: Record<string, string> = {
  adjustment: '운영 정정',
  profile: '프로필 완성',
  post: '공개 글',
  comment: '댓글',
  post_liked: '공감받음',
  listing: '분양글',
  listing_detail: '분양 상세 완성',
  consult_review: '상담 후기',
  adoption_review: '입양 후기',
  contest: '콘테스트 출품',
  winner: '콘테스트 수상',
}
