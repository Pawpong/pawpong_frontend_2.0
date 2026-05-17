'use client'

import { useForm, Controller, type Control, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CheckboxIcon, CloseIcon, FavoriteIcon, ShareIcon } from '@/shared/assets/icons'
import { Badge, ListingStats, FavoriteButton } from '@/shared/ui'
import { useCreateApplication } from '@/features/application/model/hooks'
import type { AdoptionDetailDto } from '@/shared/types'
import { ADOPTION_STATUS_LABEL, GENDER_LABEL } from '@/shared/types'
import { cn } from '@/shared/lib/Cn'

/* ── Zod 스키마 ── */
const applicationSchema = z.object({
  adoptionPlan: z.string().min(1, '입양 계획을 입력해주세요'),
  privacyConsent: z.boolean().refine((v) => v, '개인정보 수집 및 이용에 동의해주세요'),
  canProvideBasicCare: z.boolean().refine((v) => v, '기본 케어 가능 여부를 확인해주세요'),
  canAffordMedicalExpenses: z.boolean().refine((v) => v, '치료비 감당 가능 여부를 확인해주세요'),
  familyMembers: z.string().min(1, '가족 구성원을 입력해주세요'),
  allFamilyConsent: z.boolean().refine((v) => v, '가족 동의 여부를 확인해주세요'),
})

type ApplicationFormValues = z.infer<typeof applicationSchema>

interface ApplicationFormProps {
  detail: AdoptionDetailDto
}

/* ═══════════════════════════════════════════════
   입양 신청서 폼
   - 모바일(375px): 서브헤더 → 안내문구 → 회색배경(폼) → 하단고정CTA
   - 데스크탑(1280px): 서브헤더(가운데) → 브리더프로필 → 동물카드 → 회색배경(안내문구+폼+CTA)
   ═══════════════════════════════════════════════ */
const ApplicationForm = ({ detail }: ApplicationFormProps) => {
  const router = useRouter()
  const { mutate: createApplication, isPending } = useCreateApplication()

  const {
    register,
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    mode: 'onChange',
    defaultValues: {
      adoptionPlan: '',
      privacyConsent: false,
      canProvideBasicCare: false,
      canAffordMedicalExpenses: false,
      familyMembers: '',
      allFamilyConsent: false,
    },
  })

  const onSubmit = (data: ApplicationFormValues) => {
    createApplication(
      {
        breederId: detail.breeder.id,
        petId: detail.listingId,
        privacyConsent: data.privacyConsent,
        selfIntroduction: data.adoptionPlan,
        familyMembers: data.familyMembers,
        allFamilyConsent: data.allFamilyConsent,
        canProvideBasicCare: data.canProvideBasicCare,
        canAffordMedicalExpenses: data.canAffordMedicalExpenses,
        allergyTestInfo: '',
        timeAwayFromHome: '',
        livingSpaceDescription: '',
        previousPetExperience: '',
      },
      {
        onSuccess: () => {
          router.push(`/adoption/${detail.listingId}`)
        },
      },
    )
  }

  const petSummary = `${detail.name} . ${GENDER_LABEL[detail.gender]} . ${getAgeText(detail.birthDate)}`

  return (
    <div className="pb-[5.5rem] tab:pb-0">
      {/* ═══ 서브헤더 ═══
          모바일: X + "입양 신청 | 동물이름" 좌측정렬
          데스크탑: X 좌측 | "입양 신청" 가운데 | 오른쪽 빈 공간 */}
      <div className="flex items-center gap-[0.625rem] px-[1.25rem] py-[0.75rem] tab:h-[5.5rem] tab:justify-center tab:px-[6.25rem] tab:py-[0.625rem]">
        <button type="button" onClick={() => router.back()} className="tab:absolute tab:left-[6.25rem]">
          <CloseIcon className="size-[1.25rem] text-[#5d5d5d] tab:size-[1.5rem]" />
        </button>
        <p className="text-[0.875rem] font-semibold leading-[1.5] text-[#5d5d5d] tab:text-[1.25rem]">
          <span className="tab:hidden">입양 신청 | {detail.name}</span>
          <span className="hidden tab:inline">입양 신청</span>
        </p>
      </div>

      {/* ═══ 브리더 프로필 행 (데스크탑) ═══ */}
      <div className="hidden tab:block tab:px-[6.25rem]">
        <div className="flex items-center gap-[0.75rem] border-b border-transparent py-[0.625rem]">
          <div className="relative size-[2.75rem] shrink-0 overflow-hidden rounded-full bg-[#d4d4d4]">
            <Image
              src={detail.breeder.profileImageUrl}
              alt={detail.breeder.nickname}
              fill
              className="object-cover"
            />
          </div>
          <p className="text-[1.25rem] font-semibold leading-[1.375rem] text-[#5d5d5d]">
            {detail.breeder.nickname}
          </p>
          <Badge
            variant="outline"
            className="px-[0.625rem] py-[0.25rem] text-[0.875rem] leading-[1.375rem]"
          >
            {detail.breeder.bpm} BPM
          </Badge>
        </div>
      </div>

      {/* ═══ 동물 정보 카드 (데스크탑) ═══ */}
      <div className="hidden tab:block">
        <div className="flex gap-[1.5rem] bg-white px-[6.25rem] py-[0.8125rem] shadow-[1px_5px_3.75px_rgba(0,0,0,0.1)]">
          {/* 이미지 */}
          <div className="relative h-[14.6875rem] w-[14.1875rem] shrink-0 overflow-hidden rounded-[0.5725rem] bg-[#c6c6c6]">
            <Image
              src={detail.imageUrls[0]}
              alt={detail.name}
              fill
              className="object-cover"
            />
          </div>

          {/* 텍스트 정보 */}
          <div className="flex flex-1 flex-col justify-between">
            <div className="flex flex-col gap-[0.875rem]">
              {/* 이름 · 성별 · 나이 */}
              <div className="flex items-center gap-[1.125rem]">
                <span className="text-[1.25rem] font-semibold leading-[1.375rem] text-[#5d5d5d]">
                  {detail.name}
                </span>
                <span className="size-[0.25rem] rounded-full bg-[#5d5d5d]" />
                <span className="text-[1.25rem] font-semibold leading-[1.375rem] text-[#5d5d5d]">
                  {GENDER_LABEL[detail.gender]}
                </span>
                <span className="size-[0.25rem] rounded-full bg-[#5d5d5d]" />
                <span className="text-[1.25rem] font-semibold leading-[1.375rem] text-[#5d5d5d]">
                  {getAgeText(detail.birthDate)}
                </span>
              </div>

              {/* 상태 배지 */}
              <Badge variant="status" className="w-fit px-[0.585rem] py-[0.234rem] text-[0.819rem] leading-[1.286rem]">
                {ADOPTION_STATUS_LABEL[detail.status]}
              </Badge>

              {/* 설명 */}
              <p className="max-w-[34rem] text-[1.25rem] font-semibold leading-[1.375rem] text-[#5d5d5d]">
                {detail.description}
              </p>
            </div>

            {/* 하단: 통계 + 관심/공유 */}
            <div className="flex flex-col items-end gap-[0.375rem]">
              <ListingStats
                inquiryCount={detail.inquiryCount}
                favoriteCount={detail.favoriteCount}
                viewCount={detail.viewCount}
                size="lg"
              />
              <div className="flex items-center gap-[0.625rem]">
                <FavoriteButton size="sm" />
                <button
                  type="button"
                  className="flex items-center gap-[0.625rem] rounded-full p-[0.625rem] text-[0.875rem] font-medium text-[#5d5d5d]"
                >
                  <ShareIcon className="size-[1.5rem]" />
                  <span>공유</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 폼 영역 ═══ */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 모바일 안내 문구 (회색 배경 밖) */}
        <div className="px-[1.25rem] pb-[0.25rem] pt-[0.75rem] tab:hidden">
          <p className="text-[0.75rem] font-semibold leading-[1.5] text-[#5d5d5d]">
            입양 신청서 작성 이후,
            <br />
            담당 브리더와 채팅을 통해 더 상세한 입양 계획을 세워보세요
          </p>
        </div>

        {/* 회색 배경 컨테이너 */}
        <div className="mx-[1.25rem] mt-[1.996rem] rounded-[1rem] bg-[#f5f5f5] p-[0.75rem] tab:mx-[6.25rem] tab:mb-[3rem] tab:mt-[2.5rem] tab:px-[2.625rem] tab:pb-[2.5rem] tab:pt-[2.5rem]">
          {/* 데스크탑 안내 문구 (회색 배경 안 상단) */}
          <div className="hidden tab:mb-[4.379rem] tab:block">
            <p className="text-[1rem] font-semibold leading-[1.5] text-[#5d5d5d]">
              입양 신청서 작성 이후,
              <br />
              담당 브리더와 채팅을 통해 더 상세한 입양 계획을 세워보세요
            </p>
          </div>

          {/* 흰색 폼 카드 */}
          <div className="rounded-[1rem] bg-white px-[0.75rem] py-[1rem] tab:px-[4.25rem] tab:py-[2.125rem]">
            <div className="flex flex-col gap-[0.75rem] tab:gap-[2rem]">
              {/* 1. 마음에 두신 아이 */}
              <FormSection title="마음에 두신 아이가 있나요?">
                <ReadonlyInput value={petSummary} />
              </FormSection>

              {/* 2. 입양 계획 */}
              <FormSection title="입양 계획을 간단히 작성해 주세요">
                <textarea
                  {...register('adoptionPlan')}
                  placeholder="생활패턴, 주거환경, 입양 시기 등을 입력해주세요"
                  className="h-[5.125rem] w-full resize-none rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] text-[0.875rem] font-medium leading-[1.375rem] text-[#5d5d5d] placeholder:text-[#a8a8a8] focus:border-[#5d5d5d] focus:outline-none tab:h-[6.8125rem] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem] tab:text-[1rem]"
                />
              </FormSection>

              {/* 3. 필수 체크항목 */}
              <FormSection title="입양준비 확인을 위한 필수 항목을 체크해볼게요">
                <div className="flex flex-col gap-[0.375rem] tab:gap-[1.125rem]">
                  <CheckboxField
                    control={control}
                    name="privacyConsent"
                    label="개인정보 수집 및 이용에 동의합니다"
                  />
                  <CheckboxField
                    control={control}
                    name="canProvideBasicCare"
                    label="정기 예방접종/ 검강검진/ 훈련 등 기본 케어가 가능합니다."
                  />
                  <CheckboxField
                    control={control}
                    name="canAffordMedicalExpenses"
                    label="예상치 못한 질병/ 사고 치료비를 감당할 수 있습니다."
                  />
                </div>
              </FormSection>

              {/* 4. 가족 구성원 */}
              <FormSection title="함께 거주하는 가족 구성원을 입력해주세요">
                <textarea
                  {...register('familyMembers')}
                  placeholder="예: 배우자 1명,  자녀 1명, 부모님 1명"
                  className="h-[5.125rem] w-full resize-none rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] text-[0.875rem] font-medium leading-[1.375rem] text-[#5d5d5d] placeholder:text-[#a8a8a8] focus:border-[#5d5d5d] focus:outline-none tab:h-[6.8125rem] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem] tab:text-[1rem]"
                />
                <CheckboxField
                  control={control}
                  name="allFamilyConsent"
                  label="모든 가족 구성원이 입양에 동의했습니다."
                />
              </FormSection>
            </div>
          </div>

          {/* 데스크탑 CTA (회색 배경 안 우하단) */}
          <div className="hidden tab:mt-[1.5rem] tab:flex tab:justify-end">
            <button
              type="submit"
              disabled={!isValid || isPending}
              className={cn(
                'flex h-10 w-[10rem] items-center justify-center rounded-full text-[0.875rem] font-medium transition-colors',
                isValid && !isPending
                  ? 'bg-[#5d5d5d] text-white'
                  : 'bg-[#d4d4d4] text-[#5d5d5d]',
              )}
            >
              {isPending ? '제출 중...' : '상담 신청하기'}
            </button>
          </div>
        </div>

        {/* 모바일 CTA (하단 고정) */}
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-white p-[1.25rem] tab:hidden">
          <button
            type="submit"
            disabled={!isValid || isPending}
            className={cn(
              'flex h-12 w-full items-center justify-center rounded-full text-[1rem] font-semibold transition-colors',
              isValid && !isPending
                ? 'bg-[#5d5d5d] text-white'
                : 'bg-[#d4d4d4] text-[#5d5d5d]',
            )}
          >
            {isPending ? '제출 중...' : '상담 신청하기'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ── 내부 컴포넌트 ── */

const FormSection = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-[0.375rem] tab:gap-[1.125rem]">
    <p className="text-[0.875rem] font-bold leading-[1.5] text-[#5d5d5d] tab:text-[1rem]">
      {title}
    </p>
    {children}
  </div>
)

const ReadonlyInput = ({ value }: { value: string }) => (
  <div className="rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem]">
    <p className="text-[0.875rem] font-medium leading-[1.375rem] text-[#5d5d5d] tab:text-[1rem]">
      {value}
    </p>
  </div>
)

const CheckboxField = ({
  control,
  name,
  label,
}: {
  control: Control<ApplicationFormValues>
  name: FieldPath<ApplicationFormValues>
  label: string
}) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <button
        type="button"
        onClick={() => field.onChange(!field.value)}
        className="flex items-start gap-[0.75rem] rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] text-left tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem]"
      >
        <CheckboxIcon
          checked={!!field.value}
          className={cn(
            'size-[1.5rem] shrink-0',
            field.value ? 'text-[#5d5d5d]' : 'text-[#a8a8a8]',
          )}
        />
        <span className="text-[0.875rem] font-medium leading-[1.375rem] text-[#5d5d5d] tab:text-[1rem]">
          {label}
        </span>
      </button>
    )}
  />
)

/* ── 유틸 ── */
const getAgeText = (birthDate: string): string => {
  const match = birthDate.match(/(\d{4})년\s*(\d{1,2})월/)
  if (!match) return birthDate
  const birthYear = parseInt(match[1], 10)
  const birthMonth = parseInt(match[2], 10)
  const now = new Date()
  const monthsDiff = (now.getFullYear() - birthYear) * 12 + (now.getMonth() + 1 - birthMonth)
  if (monthsDiff < 12) return `${monthsDiff}개월`
  return `${Math.floor(monthsDiff / 12)}살`
}

export { ApplicationForm }
