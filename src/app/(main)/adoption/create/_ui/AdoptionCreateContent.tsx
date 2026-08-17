'use client'

import { Container, CtaModal, NavigationBar } from '@/shared/ui'
import { PostFormCTA } from '@/widgets/post-form'
import { useAdoptionCreateForm } from '../_lib/useAdoptionCreateForm'
import { PET_IMAGE_MAX } from '../_lib/constants'
import { BasicInfoSection } from './BasicInfoSection'
import { HealthInfoSection } from './HealthInfoSection'
import { ParentInfoSection } from './ParentInfoSection'
import { BreedingEnvSection } from './BreedingEnvSection'
import { ImageField } from './ImageField'

const AdoptionCreateContent = () => {
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      {/* Figma 3134-385127 — 공통 NavigationBar(976-25817) 인스턴스, 선두 아이콘만 닫기 */}
      <NavigationBar title="분양글 작성" icon="close" onBack={handleCloseClick} />

      {/* Figma 3134-385401: PC는 이미지 372 + 폼 2단(gap 100), 콘텐츠 폭 1280 고정 */}
      {/* pb-30(120px)은 fixed CTA 바(94px)를 피하는 여백 — pc에서 py로 덮으면 마지막 섹션이 가려진다 */}
      <Container className="flex-1 py-5 pb-30 pc:pt-12">
        {/* CTA 바가 fixed 라 폼 밖에 있다. 폼 경계를 만들어 Enter 제출과 보조기기 인식을 살린다 */}
        <form onSubmit={handleUpload} className="mx-auto w-full pc:max-w-320">
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

            {/* 우측 폼 컬럼 — 필드 간 gap 16 */}
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

      <PostFormCTA
        onSaveDraft={handleSaveDraft}
        onSubmit={handleUpload}
        isValid={canSubmit}
        isSubmitting={isSubmitting}
      />

      <CtaModal
        open={showGuard}
        onOpenChange={(isOpen) => !isOpen && cancelExit()}
        title="분양글 작성을 그만하시겠어요?"
        description="임시저장하면 나중에 이어서 작성할 수 있어요."
        actions={[
          { label: '임시저장', variant: 'fill', onClick: handleSaveDraft },
          { label: '분양글 작성 그만하기', variant: 'outline', onClick: handleExitConfirm },
          { label: '닫기', variant: 'ghost', onClick: cancelExit },
        ]}
      />
    </div>
  )
}

export { AdoptionCreateContent }
