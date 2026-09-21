'use client'

import { Button, Container, CtaModal, NavigationBar } from '@/shared/ui'
import { PostFormCTA } from '@/widgets/post-form'
import { useAdoptionCreateForm } from '../_lib/useAdoptionCreateForm'
import { PET_IMAGE_MAX } from '../_lib/constants'
import { BasicInfoSection } from './BasicInfoSection'
import { HealthInfoSection } from './HealthInfoSection'
import { ParentInfoSection } from './ParentInfoSection'
import { BreedingEnvSection } from './BreedingEnvSection'
import { ImageField } from './ImageField'
import { FormSection } from './FormSection'

const AdoptionCreateContent = () => {
  const {
    form,
    petImages,
    parentRows,
    breedingEnvImages,
    representativeIndex,
    setRepresentativeIndex,
    isSubmitting,
    isSavingDraft,
    canSubmit,
    submitError,
    isLoadingDraft,
    isDraftLoadError,
    retryDraft,
    showGuard,
    cancelExit,
    handleCloseClick,
    handleExitConfirm,
    handleUpload,
    handleSaveDraft,
  } = useAdoptionCreateForm()

  const {
    register,
    control,
    formState: { errors },
  } = form

  if (isLoadingDraft || isDraftLoadError) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-point-50">
        <NavigationBar title="분양글 작성" icon="close" onBack={handleCloseClick} />
        <Container className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <p
              role={isDraftLoadError ? 'alert' : 'status'}
              className="text-sm font-medium text-neutral-700"
            >
              {isDraftLoadError
                ? '임시저장 글을 불러오지 못했습니다.'
                : '임시저장 글을 불러오는 중입니다.'}
            </p>
            {isDraftLoadError && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCloseClick} className="px-4">
                  목록으로
                </Button>
                <Button variant="fill" size="sm" onClick={() => void retryDraft()} className="px-4">
                  다시 시도
                </Button>
              </div>
            )}
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-point-50 text-neutral-850">
      <NavigationBar title="분양글 작성" icon="close" onBack={handleCloseClick} />

      {/* 고정 하단 버튼에 마지막 입력란이 가려지지 않도록 여백을 유지한다. */}
      <Container className="flex-1 py-6 pb-36 tab:pt-10">
        {/* CTA 바가 fixed 라 폼 밖에 있다. 폼 경계를 만들어 Enter 제출과 보조기기 인식을 살린다 */}
        <div className="mx-auto max-w-264">
          <header className="mb-8">
            <p className="mb-2 text-sm font-semibold text-primary-600">
              새로운 가족을 만나는 첫걸음
            </p>
            <h1 className="font-cafe24 text-2xl font-bold tab:text-3xl">
              어떤 아이인지 소개해주세요
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-700">
              사진과 정확한 정보가 입양자의 신중한 선택을 도와요. 작성 중에는 임시저장할 수 있어요.
            </p>
          </header>
          <div className="grid items-start gap-8 lap:grid-cols-[minmax(0,1fr)_15rem]">
            <form onSubmit={handleUpload} className="min-w-0">
              <fieldset
                disabled={isSubmitting || isSavingDraft}
                className="flex min-w-0 flex-col gap-6"
              >
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

                <div className="flex min-w-0 flex-col gap-6">
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
                </div>
              </fieldset>

              {/* 암묵적 제출(Enter)은 폼에 submit 버튼이 있어야 동작한다. 실제 버튼은 fixed CTA 바에 있다 */}
              <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
            </form>
            <aside
              className="sticky top-24 hidden space-y-6 lap:block"
              aria-label="분양글 작성 안내"
            >
              <div className="rounded-2xl border border-neutral-150 bg-white p-5">
                <h2 className="font-semibold">작성할 내용</h2>
                <ol className="mt-5 space-y-4 text-sm text-neutral-700">
                  {['아이 사진', '기본 정보', '건강 정보', '부모 정보', '생활 환경'].map(
                    (title, index) => (
                      <li key={title} className="flex items-center gap-3">
                        <span className="flex size-6 items-center justify-center rounded-full bg-neutral-50 text-xs font-semibold text-primary-600">
                          {index + 1}
                        </span>
                        {title}
                        <span className="ml-auto text-xs">{index < 3 ? '필수' : '선택'}</span>
                      </li>
                    ),
                  )}
                </ol>
              </div>
              <div className="rounded-2xl bg-point-100 p-5 text-sm leading-relaxed">
                <h2 className="font-semibold text-primary-700">솔직한 정보가 신뢰의 시작이에요</h2>
                <p className="mt-3 text-neutral-700">
                  성격과 생활 습관뿐 아니라 건강 상태와 돌봄 시 주의할 점도 알려주세요.
                </p>
                <p className="mt-3 text-neutral-700">
                  확인되지 않은 정보는 임의로 입력하지 말고, 확인 후 등록해주세요.
                </p>
              </div>
            </aside>
          </div>
          <p className="mt-6 text-sm text-neutral-700" role="status">
            {canSubmit
              ? '필수 정보를 입력했어요. 사진과 내용을 확인한 뒤 등록해주세요.'
              : '필수 항목을 모두 입력하면 등록할 수 있어요. 미완성 글은 임시저장할 수 있어요.'}
          </p>
        </div>
      </Container>

      <PostFormCTA
        submitLabel={isSubmitting ? '등록 중…' : isSavingDraft ? '저장 중…' : '분양글 등록'}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleUpload}
        isValid={canSubmit}
        isSubmitting={isSubmitting || isSavingDraft}
      />

      <CtaModal
        open={showGuard}
        onOpenChange={(isOpen) => !isOpen && cancelExit()}
        title="분양글 작성을 그만하시겠어요?"
        description="임시저장하면 나중에 이어서 작성할 수 있어요."
        actions={[
          {
            label: '임시저장',
            variant: 'fill',
            onClick: handleSaveDraft,
            disabled: isSavingDraft || isSubmitting,
          },
          {
            label: '분양글 작성 그만하기',
            variant: 'outline',
            onClick: handleExitConfirm,
            disabled: isSavingDraft || isSubmitting,
          },
          {
            label: '닫기',
            variant: 'ghost',
            onClick: cancelExit,
            disabled: isSavingDraft || isSubmitting,
          },
        ]}
      />
    </div>
  )
}

export { AdoptionCreateContent }
