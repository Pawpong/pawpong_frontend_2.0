import type {
  CommunityClinicRecord,
  CommunityClinicVisitReason,
  CommunityExperience,
  CommunityLifeActivity,
  CommunityLifeRecord,
  CommunityRecordKind,
  CommunityWalkRecord,
} from '@/shared/types'

export const EMPTY_COMMUNITY_EXPERIENCE: CommunityExperience = {
  topics: [],
  question: false,
  route: [],
  publicPlaceConfirmed: false,
}

export const COMMUNITY_MAX_TOPICS = 3
export const COMMUNITY_MAX_TAGS = 5

export const WALK_DIFFICULTY_LABELS: Record<
  NonNullable<CommunityWalkRecord['difficulty']>,
  string
> = { easy: '편안해요', moderate: '보통이에요', hard: '힘들어요' }

export const WALK_AMENITY_LABELS: Record<
  NonNullable<CommunityWalkRecord['amenities']>[number],
  string
> = { water: '물 마실 곳', shade: '그늘', 'waste-bin': '배변 봉투함', parking: '주차' }

export const CLINIC_REASON_LABELS: Record<CommunityClinicVisitReason, string> = {
  checkup: '건강검진',
  vaccination: '예방접종',
  dental: '치과',
  skin: '피부',
  emergency: '응급',
  surgery: '수술',
  rehabilitation: '재활',
  other: '기타',
}

export const LIFE_ACTIVITY_LABELS: Record<CommunityLifeActivity, string> = {
  meal: '식사',
  grooming: '미용·목욕',
  training: '훈련',
  play: '놀이',
  rest: '휴식',
  habitat: '사육장·환경',
  other: '기타',
}

export const LIFE_CONDITION_LABELS: Record<
  NonNullable<CommunityLifeRecord['condition']>,
  string
> = { great: '아주 좋아요', usual: '평소 같아요', watching: '지켜보는 중' }

export const COMMUNITY_RECORD_LABELS: Record<CommunityRecordKind, string> = {
  walk: '산책 기록',
  clinic: '병원 방문',
  life: '반려생활',
}

export type CommunityTemplateKey = 'walk' | 'clinic' | 'life' | 'travel' | 'question'

export interface CommunityTemplate {
  key: CommunityTemplateKey
  label: string
  hint: string
  /** 이 틀이 대표하는 주제 */
  topic: string
  record?: CommunityRecordKind
  /** 본문 입력란에 보여 줄 글감 */
  prompt: string
}

export const COMMUNITY_TEMPLATES: CommunityTemplate[] = [
  {
    key: 'walk',
    label: '산책 기록',
    hint: '걸은 시간·거리·코스',
    topic: 'walk',
    record: 'walk',
    prompt: '어디를 걸었나요? 길 상태, 아이가 좋아한 곳, 조심할 점을 적어 주세요.',
  },
  {
    key: 'clinic',
    label: '병원 방문',
    hint: '방문 목적·대기·비용',
    topic: 'clinic',
    record: 'clinic',
    prompt: '어떤 일로 방문했나요? 진료 과정, 설명이 어땠는지, 다음에 챙길 점을 적어 주세요.',
  },
  {
    key: 'life',
    label: '일상·돌봄',
    hint: '식사·미용·훈련·놀이',
    topic: 'daily',
    record: 'life',
    prompt: '오늘 우리 아이는 어떤 하루를 보냈나요?',
  },
  {
    key: 'travel',
    label: '여행·나들이',
    hint: '다녀온 곳과 동반 팁',
    topic: 'travel',
    prompt: '어디를 다녀왔나요? 동반 조건, 이동 방법, 챙기면 좋은 준비물을 적어 주세요.',
  },
  {
    key: 'question',
    label: '질문하기',
    hint: '다른 보호자에게 묻기',
    topic: 'question',
    prompt: '무엇이 궁금한가요? 아이의 나이·상황과 이미 해 본 것을 함께 적으면 답을 받기 쉬워요.',
  },
]

/** 브라우저 시간대의 오늘 날짜 (YYYY-MM-DD) */
export function communityToday(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function isCommunityCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export function isCommunityTemplateActive(
  experience: CommunityExperience,
  template: CommunityTemplate,
): boolean {
  if (template.record) return experience[template.record] !== undefined
  if (template.key === 'question') return experience.question
  return experience.topics.includes(template.topic)
}

/** 틀을 켜면 대표 주제와 기록 칸을 함께 열고, 끄면 그 틀이 만든 것만 치운다. */
export function toggleCommunityTemplate(
  experience: CommunityExperience,
  template: CommunityTemplate,
  today = communityToday(),
): CommunityExperience {
  const active = isCommunityTemplateActive(experience, template)
  const next: CommunityExperience = { ...experience }
  if (active) {
    next.topics = experience.topics.filter((topic) => topic !== template.topic)
    if (template.record) delete next[template.record]
    if (template.key === 'question') next.question = false
    return next
  }
  // 주제 3개가 찼으면 기록 칸만 열고 주제는 작성자가 고른 것을 지킨다.
  if (
    !experience.topics.includes(template.topic) &&
    experience.topics.length < COMMUNITY_MAX_TOPICS
  )
    next.topics = [...experience.topics, template.topic]
  if (template.key === 'question') next.question = true
  if (template.record === 'walk') next.walk = { walkedOn: today }
  if (template.record === 'clinic')
    next.clinic = { visitedOn: today, clinicName: '', visitReason: 'other' }
  if (template.record === 'life') next.life = { recordedOn: today, activity: 'other' }
  return next
}

const integerIn = (value: number | undefined, min: number, max: number) =>
  value === undefined || (Number.isSafeInteger(value) && value >= min && value <= max)

/** 서버 검증과 같은 범위를 저장 전에 알려 준다. 문제가 없으면 null. */
export function validateCommunityExperience(experience: CommunityExperience): string | null {
  const { walk, clinic, life, route } = experience
  if (route.length > 0) {
    if (route.some((point) => !point.name.trim())) return '지도에 담은 장소의 이름을 적어 주세요.'
    if (!experience.publicPlaceConfirmed) return '공개 장소가 맞는지 확인란에 표시해 주세요.'
  }
  if (walk) {
    if (!isCommunityCalendarDate(walk.walkedOn)) return '산책한 날짜를 골라 주세요.'
    if (!integerIn(walk.durationMinutes, 1, 1440))
      return '산책 시간은 1분부터 1,440분까지 적을 수 있어요.'
    if (!integerIn(walk.distanceMeters, 0, 100000)) return '산책 거리는 100km까지 적을 수 있어요.'
  }
  if (clinic) {
    if (!isCommunityCalendarDate(clinic.visitedOn)) return '병원에 방문한 날짜를 골라 주세요.'
    if (!clinic.clinicName.trim()) return '방문한 병원 이름을 적어 주세요.'
    if (clinic.clinicName.length > 80) return '병원 이름은 80자까지 적을 수 있어요.'
    if (!integerIn(clinic.waitMinutes, 0, 1440)) return '대기 시간은 1,440분까지 적을 수 있어요.'
    if (!integerIn(clinic.costKrw, 0, 100000000)) return '비용은 1억 원까지 적을 수 있어요.'
    if (clinic.followUpOn !== undefined) {
      if (!isCommunityCalendarDate(clinic.followUpOn)) return '다음 방문 예정일을 확인해 주세요.'
      if (clinic.followUpOn < clinic.visitedOn)
        return '다음 방문 예정일은 방문한 날짜 이후여야 해요.'
    }
  }
  if (life) {
    if (!isCommunityCalendarDate(life.recordedOn)) return '기록한 날짜를 골라 주세요.'
    if (life.petName !== undefined && life.petName.length > 40)
      return '아이 이름은 40자까지 적을 수 있어요.'
  }
  return null
}

/** 빈 선택 값을 빼고 이름의 앞뒤 공백을 정리해 서버 형식에 맞춘다. */
export function prepareCommunityExperience(experience: CommunityExperience): CommunityExperience {
  const next: CommunityExperience = {
    topics: experience.topics,
    question: experience.question,
    route: experience.route.map((point) => ({ ...point, name: point.name.trim() })),
    publicPlaceConfirmed: experience.route.length > 0 && experience.publicPlaceConfirmed,
    ...(experience.tags?.length ? { tags: experience.tags } : {}),
  }
  if (experience.walk) {
    const { amenities, ...walk } = experience.walk
    next.walk = { ...walk, ...(amenities?.length ? { amenities } : {}) }
  }
  if (experience.clinic)
    next.clinic = { ...experience.clinic, clinicName: experience.clinic.clinicName.trim() }
  if (experience.life) {
    const { petName, ...life } = experience.life
    next.life = { ...life, ...(petName?.trim() ? { petName: petName.trim() } : {}) }
  }
  return next
}

/** 주제·태그·기록·장소가 하나도 없으면 보낼 경험이 없는 글이다. */
export function isCommunityExperienceEmpty(experience: CommunityExperience): boolean {
  return (
    !experience.topics.length &&
    !experience.tags?.length &&
    !experience.question &&
    !experience.route.length &&
    !experience.walk &&
    !experience.clinic &&
    !experience.life
  )
}

/** 본문 입력란 글감 — 가장 먼저 켠 틀의 것을 쓴다. */
export function communityWritingPrompt(experience?: CommunityExperience | null): string | null {
  if (!experience) return null
  return (
    COMMUNITY_TEMPLATES.find((template) => isCommunityTemplateActive(experience, template))
      ?.prompt ?? null
  )
}

export function formatCommunityDate(value: string): string {
  if (!isCommunityCalendarDate(value)) return value
  const [year, month, day] = value.split('-').map(Number)
  return `${year}년 ${month}월 ${day}일`
}

export function formatCommunityDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (!hours) return `${rest}분`
  return rest ? `${hours}시간 ${rest}분` : `${hours}시간`
}

export function formatCommunityDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`
  return `${Number((meters / 1000).toFixed(1))}km`
}

export interface CommunityRecordFact {
  label: string
  value: string
}

export interface CommunityRecordSummary {
  kind: CommunityRecordKind
  title: string
  date: string
  facts: CommunityRecordFact[]
}

const walkSummary = (walk: CommunityWalkRecord): CommunityRecordSummary => ({
  kind: 'walk',
  title: COMMUNITY_RECORD_LABELS.walk,
  date: formatCommunityDate(walk.walkedOn),
  facts: [
    ...(walk.durationMinutes !== undefined
      ? [{ label: '시간', value: formatCommunityDuration(walk.durationMinutes) }]
      : []),
    ...(walk.distanceMeters !== undefined
      ? [{ label: '거리', value: formatCommunityDistance(walk.distanceMeters) }]
      : []),
    ...(walk.difficulty
      ? [{ label: '난이도', value: WALK_DIFFICULTY_LABELS[walk.difficulty] }]
      : []),
    ...(walk.leashRequired !== undefined
      ? [{ label: '목줄', value: walk.leashRequired ? '꼭 필요해요' : '자유로운 구간이 있어요' }]
      : []),
    ...(walk.amenities?.length
      ? [
          {
            label: '편의',
            value: walk.amenities.map((item) => WALK_AMENITY_LABELS[item] ?? item).join(' · '),
          },
        ]
      : []),
  ],
})

const clinicSummary = (clinic: CommunityClinicRecord): CommunityRecordSummary => ({
  kind: 'clinic',
  title: COMMUNITY_RECORD_LABELS.clinic,
  date: formatCommunityDate(clinic.visitedOn),
  facts: [
    { label: '병원', value: clinic.clinicName },
    { label: '방문 목적', value: CLINIC_REASON_LABELS[clinic.visitReason] ?? clinic.visitReason },
    ...(clinic.waitMinutes !== undefined
      ? [
          {
            label: '대기',
            value: clinic.waitMinutes ? formatCommunityDuration(clinic.waitMinutes) : '바로 진료',
          },
        ]
      : []),
    ...(clinic.costKrw !== undefined
      ? [{ label: '비용', value: `${clinic.costKrw.toLocaleString('ko-KR')}원` }]
      : []),
    ...(clinic.followUpOn
      ? [{ label: '다음 방문', value: formatCommunityDate(clinic.followUpOn) }]
      : []),
  ],
})

const lifeSummary = (life: CommunityLifeRecord): CommunityRecordSummary => ({
  kind: 'life',
  title: COMMUNITY_RECORD_LABELS.life,
  date: formatCommunityDate(life.recordedOn),
  facts: [
    { label: '활동', value: LIFE_ACTIVITY_LABELS[life.activity] ?? life.activity },
    ...(life.petName ? [{ label: '아이', value: life.petName }] : []),
    ...(life.condition
      ? [{ label: '상태', value: LIFE_CONDITION_LABELS[life.condition] ?? life.condition }]
      : []),
  ],
})

/** 상세·카드에서 같은 문구로 보여 주기 위한 기록 요약 */
export function summarizeCommunityRecords(
  experience?: CommunityExperience | null,
): CommunityRecordSummary[] {
  if (!experience) return []
  return [
    ...(experience.walk ? [walkSummary(experience.walk)] : []),
    ...(experience.clinic ? [clinicSummary(experience.clinic)] : []),
    ...(experience.life ? [lifeSummary(experience.life)] : []),
  ]
}
