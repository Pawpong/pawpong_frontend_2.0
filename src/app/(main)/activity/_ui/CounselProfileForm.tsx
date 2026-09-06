'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Container, ListState, TextLabel, TextareaField } from '@/shared/ui'
import { ADOPTION_SURVEY_QUESTIONS } from '@/shared/config'
import { adopterQueries } from '@/entities/adopter'
import { useUpdateAdopterProfile } from '@/features/adopter'
import type { AdopterCounselProfile } from '@/shared/types'

const MAX_LENGTH = 500

/** 서버 필드 ↔ 가입 설문 문항 매핑 — 가입 때와 같은 문구를 그대로 쓴다 */
const FIELDS = [
  { name: 'selfIntroduction', ...ADOPTION_SURVEY_QUESTIONS.selfIntroduction },
  { name: 'dailyAbsenceHours', ...ADOPTION_SURVEY_QUESTIONS.timeAwayFromHome },
  { name: 'livingSpaceDescription', ...ADOPTION_SURVEY_QUESTIONS.livingSpaceDescription },
] as const

type CounselField = (typeof FIELDS)[number]['name']
type CounselValues = Record<CounselField, string>

const toValues = (counsel: AdopterCounselProfile | null): CounselValues => ({
  selfIntroduction: counsel?.selfIntroduction ?? '',
  dailyAbsenceHours: counsel?.dailyAbsenceHours ?? '',
  livingSpaceDescription: counsel?.livingSpaceDescription ?? '',
})

/**
 * 폼 본체 — 서버 값이 도착한 뒤에만 마운트되므로 초기값을 useState 에 바로 넣는다
 * (effect 로 뒤늦게 채우면 첫 렌더가 빈 폼으로 깜빡인다).
 */
const CounselProfileFields = ({ initialValues }: { initialValues: CounselValues }) => {
  const updateProfile = useUpdateAdopterProfile()
  const [values, setValues] = useState(initialValues)
  const [isSaved, setIsSaved] = useState(false)

  const handleChange = (name: CounselField, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setIsSaved(false)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (updateProfile.isPending) return
    updateProfile.mutate({ counselDefaultProfile: values }, { onSuccess: () => setIsSaved(true) })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-168 flex-col gap-6">
      <p className="text-sm leading-[1.6] font-medium text-neutral-700">
        입양 신청을 보낼 때 이 내용이 기본값으로 채워집니다. 이미 보낸 신청서는 바뀌지 않아요.
      </p>

      {FIELDS.map(({ name, title, placeholder }) => (
        <div key={name} className="flex w-full flex-col gap-0.5">
          <TextLabel size="14" requirement="선택">
            {title}
          </TextLabel>
          <TextareaField
            value={values[name]}
            placeholder={placeholder}
            maxLength={MAX_LENGTH}
            currentLength={values[name].length}
            onChange={(event) => handleChange(name, event.target.value)}
          />
        </div>
      ))}

      {updateProfile.isError && (
        <p role="alert" className="text-xs text-error-700">
          저장하지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        {isSaved && !updateProfile.isPending && (
          <span role="status" className="text-xs font-medium text-neutral-700">
            저장했습니다
          </span>
        )}
        <Button type="submit" size="lg" disabled={updateProfile.isPending} className="px-6">
          {updateProfile.isPending ? '저장 중' : '저장'}
        </Button>
      </div>
    </form>
  )
}

/**
 * 공통 입양 신청서(상담 사전 정보) 편집.
 * 가입 때 한 번 쓰고 끝이던 값을 여기서 고친다 — 이후 보내는 신청서에 이 값이 채워진다.
 */
const CounselProfileForm = () => {
  const { data: profile, isPending, isError, refetch } = useQuery(adopterQueries.profile())

  return (
    <Container className="px-4 py-5 tab:py-8 pc:py-10">
      <ListState
        isPending={isPending}
        isError={isError}
        isEmpty={false}
        loadingText="신청서를 불러오는 중입니다."
        errorText="신청서를 불러오지 못했습니다."
        emptyText=""
        errorAction={
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            다시 시도
          </Button>
        }
      >
        {/* 조사를 건너뛴 계정은 counselDefaultProfile 이 null 이라 빈 폼으로 시작한다 */}
        <CounselProfileFields initialValues={toValues(profile?.counselDefaultProfile ?? null)} />
      </ListState>
    </Container>
  )
}

export { CounselProfileForm }
