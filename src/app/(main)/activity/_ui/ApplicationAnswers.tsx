import { TEXT } from '@/shared/config'
import { EmptyState } from '@/shared/ui'
import type { CustomQuestionResponse, StandardResponses } from '@/shared/types'

const STANDARD_QUESTIONS: Array<{ key: keyof StandardResponses; label: string }> = [
  { key: 'selfIntroduction', label: '자기소개' },
  { key: 'familyMembers', label: '가족 구성원' },
  { key: 'allFamilyConsent', label: '가족 모두의 입양 동의' },
  { key: 'allergyTestInfo', label: '알레르기 확인' },
  { key: 'timeAwayFromHome', label: '집을 비우는 시간' },
  { key: 'livingSpaceDescription', label: '함께 지낼 공간' },
  { key: 'previousPetExperience', label: '반려동물 경험' },
  { key: 'canProvideBasicCare', label: '기본 케어 가능 여부' },
  { key: 'canAffordMedicalExpenses', label: '치료비 감당 가능 여부' },
  { key: 'preferredPetDescription', label: '원하는 아이의 특징' },
  { key: 'desiredAdoptionTiming', label: '희망 입양 시기' },
  { key: 'additionalNotes', label: '추가 문의사항' },
  { key: 'adoptionPlan', label: '입양 계획' },
]

const QUESTION_GROUPS = [
  {
    title: '신청자와 가족',
    keys: ['selfIntroduction', 'familyMembers', 'allFamilyConsent', 'allergyTestInfo'],
  },
  {
    title: '함께 지낼 환경',
    keys: [
      'timeAwayFromHome',
      'livingSpaceDescription',
      'previousPetExperience',
      'canProvideBasicCare',
      'canAffordMedicalExpenses',
    ],
  },
  {
    title: '입양 계획과 문의',
    keys: ['preferredPetDescription', 'desiredAdoptionTiming', 'additionalNotes', 'adoptionPlan'],
  },
]

const formatAnswer = (answer: unknown) => {
  if (typeof answer === 'boolean') return answer ? '동의해요' : '동의하지 않아요'
  if (Array.isArray(answer)) return answer.join(', ')
  return String(answer ?? '')
}

const AnswerRow = ({ label, answer }: { label: string; answer: unknown }) => {
  const value = formatAnswer(answer)
  if (!value) return null

  return (
    <div className="grid min-w-0 gap-2 py-5 tab:grid-cols-[11rem_minmax(0,1fr)] tab:gap-8 tab:py-6">
      <dt className={TEXT.sub}>{label}</dt>
      <dd className={`${TEXT.prose} text-neutral-850`}>{value}</dd>
    </div>
  )
}

export const ApplicationAnswers = ({
  title,
  standardResponses,
  customResponses,
}: {
  title: string
  standardResponses?: StandardResponses
  customResponses: CustomQuestionResponse[]
}) => {
  const standardAnswers = STANDARD_QUESTIONS.filter(
    ({ key }) => standardResponses?.[key] !== undefined && standardResponses[key] !== '',
  )
  const hasAnswers = standardAnswers.length > 0 || customResponses.length > 0

  return (
    <section className="min-w-0">
      <h2 className={TEXT.section}>{title}</h2>
      {hasAnswers ? (
        <div className="mt-6 flex flex-col gap-8">
          {QUESTION_GROUPS.map((group) => {
            const answers = standardAnswers.filter(({ key }) => group.keys.includes(key))
            if (!answers.length) return null
            return (
              <section key={group.title}>
                <h3 className={`${TEXT.body} border-b border-neutral-300 pb-3`}>{group.title}</h3>
                <dl className="divide-y divide-neutral-150">
                  {answers.map(({ key, label }) => (
                    <AnswerRow key={key} label={label} answer={standardResponses?.[key]} />
                  ))}
                </dl>
              </section>
            )
          })}
          {customResponses.length > 0 && (
            <section>
              <h3 className={`${TEXT.body} border-b border-neutral-300 pb-3`}>브리더 추가 질문</h3>
              <dl className="divide-y divide-neutral-150">
                {customResponses.map((response) => (
                  <AnswerRow
                    key={response.questionId}
                    label={response.questionLabel}
                    answer={response.answer}
                  />
                ))}
              </dl>
            </section>
          )}
        </div>
      ) : (
        <EmptyState message="저장된 신청 답변이 없습니다." className="py-6 text-neutral-500" />
      )}
    </section>
  )
}
