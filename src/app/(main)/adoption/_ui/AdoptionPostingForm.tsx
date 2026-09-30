'use client'

import type { BaseSyntheticEvent, ComponentProps, ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Button, Container, NavigationBar } from '@/shared/ui'
import { PostFormCTA } from '@/widgets/post-form'
import {
  BasicInfoSection,
  BreedingEnvSection,
  FormSection,
  HealthInfoSection,
  ImageField,
  ParentInfoSection,
  PET_IMAGE_MAX,
  type AdoptionCreateFormValues,
  type AdoptionCreateParsedValues,
} from '@/widgets/adoption-form'

type ImageFieldProps = ComponentProps<typeof ImageField>

/** useImageUpload 결과 중 폼이 쓰는 부분 */
interface ImageState {
  images: ImageFieldProps['images']
  handleAddImages: ImageFieldProps['onAdd']
  handleRemoveImage: ImageFieldProps['onRemove']
}

interface AdoptionPostingFormProps {
  // ── 폼 상태 (useAdoptionCreateForm / useAdoptionEditForm 결과) ──
  form: UseFormReturn<AdoptionCreateFormValues, unknown, AdoptionCreateParsedValues>
  petImages: ImageState
  breedingEnvImages: ImageState
  parentRows: ComponentProps<typeof ParentInfoSection>['parentRows']
  representativeIndex: number
  setRepresentativeIndex: (index: number) => void
  // ── 화면 문구·액션 ──
  /** 상단 바 제목 (분양글 작성 / 분양글 수정) */
  navTitle: string
  onClose: () => void
  eyebrow: string
  title: string
  description: string
  /** react-hook-form handleSubmit 결과 — 폼 submit·사이드바·하단 바가 같이 쓴다 */
  onSubmit: (event?: BaseSyntheticEvent) => unknown
  submitLabel: string
  canSubmit: boolean
  /** 제출·임시저장 진행 중 — 입력과 버튼을 함께 잠근다 */
  isBusy: boolean
  /** 없으면 임시저장 버튼을 숨긴다 (발행된 글 수정) */
  onSaveDraft?: () => void
  submitError?: string | null
  /** 폼 아래 안내 — 필수 항목 충족 여부에 따라 호출부가 문구를 고른다 */
  statusText: string
  /** 나가기 확인 모달 등 */
  overlay?: ReactNode
}

/** 분양글 작성·수정 공통 폼 — 헤더, 섹션, lap+ 사이드바 CTA, 그 미만 하단 고정 CTA */
const AdoptionPostingForm = ({
  form: {
    control,
    register,
    formState: { errors },
  },
  petImages,
  breedingEnvImages,
  parentRows,
  representativeIndex,
  setRepresentativeIndex,
  navTitle,
  onClose,
  eyebrow,
  title,
  description,
  onSubmit,
  submitLabel,
  canSubmit,
  isBusy,
  onSaveDraft,
  submitError,
  statusText,
  overlay,
}: AdoptionPostingFormProps) => (
  <div className="flex min-h-screen w-full flex-col bg-point-50 text-neutral-850">
    <NavigationBar title={navTitle} icon="close" onBack={onClose} className="bg-transparent" />

    {/* 고정 하단 버튼에 마지막 입력란이 가려지지 않도록 여백을 둔다. lap+ 는 고정 바가 없어 되돌린다 */}
    <Container className="flex-1 py-6 pb-36 tab:pt-10 lap:pb-6">
      <div className="mx-auto max-w-264">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold text-primary-600">{eyebrow}</p>
          <h1 className="font-cafe24 text-2xl font-bold tab:text-3xl">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700">{description}</p>
        </header>
        <div className="grid items-start gap-8 lap:grid-cols-[minmax(0,1fr)_15rem]">
          {/* CTA 바가 fixed 라 폼 밖에 있다. 폼 경계를 만들어 Enter 제출과 보조기기 인식을 살린다 */}
          <form onSubmit={onSubmit} className="min-w-0">
            <fieldset disabled={isBusy} className="flex min-w-0 flex-col gap-6">
              <FormSection
                title="아이 사진"
                step={1}
                required
                description="현재 모습을 잘 보여주는 사진을 1~10장 올려주세요. 사진을 눌러 대표사진을 바꿀 수 있어요."
              >
                <ImageField
                  images={petImages.images}
                  onAdd={petImages.handleAddImages}
                  onRemove={petImages.handleRemoveImage}
                  maxImages={PET_IMAGE_MAX}
                  requirement="필수"
                  representativeIndex={representativeIndex}
                  onSetRepresentative={setRepresentativeIndex}
                />
              </FormSection>
              <BasicInfoSection control={control} register={register} errors={errors} />
              <HealthInfoSection control={control} register={register} errors={errors} />
              <ParentInfoSection
                control={control}
                register={register}
                errors={errors}
                parentRows={parentRows}
              />
              <BreedingEnvSection
                register={register}
                images={breedingEnvImages.images}
                onAddImages={breedingEnvImages.handleAddImages}
                onRemoveImage={breedingEnvImages.handleRemoveImage}
              />
              {submitError && (
                <p role="alert" className="rounded-xl bg-error-50 p-4 text-sm text-error-700">
                  {submitError}
                </p>
              )}
            </fieldset>

            {/* 암묵적 제출(Enter)은 폼에 submit 버튼이 있어야 동작한다.
                실제 버튼은 lap+ 사이드바, 그 미만은 하단 고정 바에 있다 */}
            <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
          </form>
          <aside
            className="sticky top-24 hidden space-y-6 lap:block"
            aria-label={`${navTitle} 안내`}
          >
            <div className="rounded-2xl bg-secondary-200 p-5 text-sm leading-relaxed">
              <h2 className="font-semibold text-primary-700">솔직한 정보가 신뢰의 시작이에요</h2>
              <p className="mt-3 text-neutral-700">
                성격과 생활 습관뿐 아니라 건강 상태와 돌봄 시 주의할 점도 알려주세요.
              </p>
              <p className="mt-3 text-neutral-700">
                확인되지 않은 정보는 임의로 입력하지 말고, 확인 후 등록해주세요.
              </p>
            </div>

            {/* 사이드바가 좁아 한 줄에 하나씩 둔다 */}
            <div className="flex flex-col gap-3">
              {onSaveDraft && (
                <Button intent="secondary" onClick={onSaveDraft} disabled={isBusy} width="full">
                  임시저장
                </Button>
              )}
              <Button onClick={() => void onSubmit()} disabled={!canSubmit || isBusy} width="full">
                {submitLabel}
              </Button>
            </div>
          </aside>
        </div>
        <p className="mt-6 text-sm text-neutral-700" role="status">
          {statusText}
        </p>
      </div>
    </Container>

    {/* lap 부터는 사이드바 버튼이 대신하므로 숨긴다 */}
    <div className="lap:hidden">
      <PostFormCTA
        className="bg-point-50"
        submitLabel={submitLabel}
        onSaveDraft={onSaveDraft}
        onSubmit={() => void onSubmit()}
        isValid={canSubmit}
        isSubmitting={isBusy}
      />
    </div>

    {overlay}
  </div>
)

export { AdoptionPostingForm }
