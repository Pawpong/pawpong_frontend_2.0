import type { ReactNode } from 'react'
import {
  Controller,
  type Control,
  type FieldPath,
  type UseFormRegister,
  type UseFormWatch,
} from 'react-hook-form'
import { Button, Checkbox, Container, Input, TextLabel, TextareaField } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { ApplicationFormValues, ApplicationTextField } from '../_lib/schema'

// [refactored] textarea 글자 수 제한(100)을 공통 컴포넌트 옆으로 이동 (ApplicationForm에서 옮겨옴)
const TEXTAREA_MAX_LENGTH = 100

// [refactored] 라벨 + 필드 래퍼 — 라벨은 공통 TextLabel(Figma 926-25253 label-필수)에 위임
const LabeledField = ({
  title,
  size = 'md',
  gap = 'gap-1',
  requirement = '필수',
  children,
}: {
  title: string
  size?: 'md' | 'lg'
  gap?: 'gap-1' | 'gap-5'
  requirement?: '필수' | '선택'
  children: ReactNode
}) => (
  <div className={cn('flex flex-col', gap)}>
    <TextLabel size="14" requirement={requirement} className={cn(size === 'lg' && 'tab:text-base')}>
      {title}
    </TextLabel>
    {children}
  </div>
)

// [refactored] LabeledField + TextareaField + 글자 수 카운터 패턴(5회 반복) 통합
const CountedTextareaField = ({
  title,
  placeholder,
  name,
  register,
  watch,
  requirement = '필수',
}: {
  title: string
  placeholder: string
  name: ApplicationTextField
  register: UseFormRegister<ApplicationFormValues>
  watch: UseFormWatch<ApplicationFormValues>
  requirement?: '필수' | '선택'
}) => (
  <LabeledField title={title} requirement={requirement}>
    <TextareaField
      placeholder={placeholder}
      maxLength={TEXTAREA_MAX_LENGTH}
      currentLength={watch(name)?.length ?? 0}
      {...register(name)}
    />
  </LabeledField>
)

// [refactored] 읽기 전용 입력(입양하는 동물) — 규격이 공통 Input과 같아 readOnly로 대체
const ReadonlyInput = ({ value }: { value: string }) => <Input readOnly value={value} />

// 체크박스 — 공통 Checkbox(기본 large 24px) + 라벨 lg/medium 14→탭+ 16
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
      // [refactored] 브랜드 스타일이 공통 Checkbox 기본값으로 이동 — 커스텀 className 제거
      <label className="flex w-full cursor-pointer items-center gap-1.5">
        <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(v === true)} />
        <span className="flex-1 text-sm leading-[1.5] font-medium text-neutral-850 tab:text-base">
          {label}
        </span>
      </label>
    )}
  />
)

// [refactored] 하단 CTA 바 — 버튼 스타일은 공통 Button(variant outline/primary)에 위임하고
// 크기·반응형 라벨만 이 시안(Figma 1654-161691/97/03) 규격으로 얹는다
const FooterCtaBar = ({
  onCancel,
  isValid,
  isPending,
  children,
}: {
  onCancel: () => void
  isValid: boolean
  isPending: boolean
  /** 바 위에 겹쳐 띄우는 요소 (실패 토스트) — 위치는 바가 자기 높이를 알고 잡는다 */
  children?: ReactNode
}) => (
  <div className="fixed inset-x-0 bottom-0 z-10 flex items-center gap-2.5 bg-white px-4 py-4 tab:justify-end tab:gap-5 tab:px-12 tab:py-3 pc:px-20">
    {/* [refactored] bottom 값은 바 높이(mo 80 / tab+ 64)에서 나오므로 호출부가 아니라 여기서 관리 */}
    {children && (
      <Container className="absolute inset-x-0 bottom-20 px-4 tab:bottom-16">{children}</Container>
    )}
    {/* 좌측 스페이서 (tab+) */}
    <div className="hidden h-[2.8125rem] flex-1 tab:block" />
    {/* 버튼 그룹 — mo: 전체폭 / tab+: 360px(max-536) */}
    <div className="flex flex-1 items-center gap-2.5 tab:max-w-[33.5rem] tab:flex-none tab:basis-[22.5rem] tab:gap-5">
      <Button
        variant="outline"
        size="lg"
        onClick={onCancel}
        className="w-[7.3125rem] shrink-0 whitespace-nowrap tab:h-10 tab:w-auto tab:max-w-[16.125rem] tab:flex-1"
      >
        <span className="pc:hidden">신청 취소</span>
        <span className="hidden pc:inline">신청 취소하기</span>
      </Button>
      <Button
        type="submit"
        size="lg"
        disabled={!isValid || isPending}
        className="max-w-[18.5625rem] flex-1 whitespace-nowrap tab:h-10 tab:max-w-[16.125rem]"
      >
        {isPending ? (
          '제출 중...'
        ) : (
          <>
            <span className="tab:hidden">상담 신청하기</span>
            <span className="hidden tab:inline pc:hidden">입양 상담</span>
            <span className="hidden pc:inline">입양 상담하기</span>
          </>
        )}
      </Button>
    </div>
  </div>
)

export { LabeledField, CountedTextareaField, ReadonlyInput, CheckboxField, FooterCtaBar }
