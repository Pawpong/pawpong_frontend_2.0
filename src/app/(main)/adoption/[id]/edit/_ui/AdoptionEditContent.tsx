'use client'

import { Button, Container, CtaModal, NavigationBar } from '@/shared/ui'
import { PostFormCTA } from '@/widgets/post-form'
import { PET_IMAGE_MAX } from '../../../create/_lib/constants'
import { BasicInfoSection } from '../../../create/_ui/BasicInfoSection'
import { HealthInfoSection } from '../../../create/_ui/HealthInfoSection'
import { ParentInfoSection } from '../../../create/_ui/ParentInfoSection'
import { BreedingEnvSection } from '../../../create/_ui/BreedingEnvSection'
import { ImageField } from '../../../create/_ui/ImageField'
import { useAdoptionEditForm } from '../_lib/useAdoptionEditForm'

interface AdoptionEditContentProps {
  petId: string
}

/**
 * 분양글 수정 화면.
 * 작성 화면과 같은 섹션·같은 스키마를 쓰고, 임시저장 버튼만 빼고 제출을 PATCH 로 바꾼다.
 */
const AdoptionEditContent = ({ petId }: AdoptionEditContentProps) => {
  const {
    form,
    petImages,
    parentRows,
    breedingEnvImages,
    representativeIndex,
    setRepresentativeIndex,
    isSubmitting,
    canSubmit,
    submitError,
    isLoading,
    isLoadError,
    retry,
    showGuard,
    cancelExit,
    handleCloseClick,
    handleExitConfirm,
    handleSubmit,
  } = useAdoptionEditForm(petId)

  const {
    register,
    control,
    formState: { errors },
  } = form

  // 남의 글이면 서버가 막으므로 여기서도 '불러오지 못했습니다' 로 수렴한다
  if (isLoading || isLoadError) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-white">
        <NavigationBar title="분양글 수정" icon="close" onBack={handleCloseClick} />
        <Container className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <p
              role={isLoadError ? 'alert' : 'status'}
              className="text-sm font-medium text-neutral-700"
            >
              {isLoadError ? '분양글을 불러오지 못했습니다.' : '분양글을 불러오는 중입니다.'}
            </p>
            {isLoadError && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCloseClick} className="px-4">
                  돌아가기
                </Button>
                <Button variant="fill" size="sm" onClick={() => void retry()} className="px-4">
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
    <div className="flex min-h-screen w-full flex-col bg-white">
      <NavigationBar title="분양글 수정" icon="close" onBack={handleCloseClick} />

      <Container className="flex-1 py-5 pb-30 pc:pt-12">
        <form onSubmit={handleSubmit} className="mx-auto w-full pc:max-w-320">
          <div className="flex flex-col gap-[1.1875rem] pc:flex-row pc:gap-25">
            <ImageField
              images={petImages.images}
              onAdd={petImages.handleAddImages}
              onRemove={petImages.handleRemoveImage}
              maxImages={PET_IMAGE_MAX}
              requirement="필수"
              representativeIndex={representativeIndex}
              onSetRepresentative={setRepresentativeIndex}
            />

            <div className="flex flex-1 flex-col gap-4">
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

              {submitError && <p className="text-sm text-error-500">{submitError}</p>}
            </div>
          </div>

          {/* 암묵적 제출(Enter)은 폼에 submit 버튼이 있어야 동작한다. 실제 버튼은 fixed CTA 바에 있다 */}
          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>
      </Container>

      {/* 발행된 글이라 임시저장이 없다 — onSaveDraft 를 넘기지 않으면 그 버튼이 숨는다 */}
      <PostFormCTA
        onSubmit={handleSubmit}
        submitLabel="수정 완료"
        isValid={canSubmit}
        isSubmitting={isSubmitting}
      />

      <CtaModal
        open={showGuard}
        onOpenChange={(isOpen) => !isOpen && cancelExit()}
        title="수정을 그만하시겠어요?"
        description="지금 나가면 고친 내용이 사라져요."
        actions={[
          {
            label: '수정 그만하기',
            variant: 'outline',
            onClick: handleExitConfirm,
            disabled: isSubmitting,
          },
          { label: '계속 수정하기', variant: 'ghost', onClick: cancelExit, disabled: isSubmitting },
        ]}
      />
    </div>
  )
}

export { AdoptionEditContent }
