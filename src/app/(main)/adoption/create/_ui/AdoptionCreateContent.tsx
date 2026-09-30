'use client'

import { Button, Container, CtaModal, NavigationBar } from '@/shared/ui'
import { AdoptionPostingForm } from '../../_ui/AdoptionPostingForm'
import { useAdoptionCreateForm } from '../_lib/useAdoptionCreateForm'

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

  if (isLoadingDraft || isDraftLoadError) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-point-50">
        <NavigationBar
          title="분양글 작성"
          icon="close"
          onBack={handleCloseClick}
          className="bg-transparent"
        />
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
                <Button intent="secondary" size="sm" onClick={handleCloseClick}>
                  목록으로
                </Button>
                <Button intent="dark" size="sm" onClick={() => void retryDraft()}>
                  다시 시도
                </Button>
              </div>
            )}
          </div>
        </Container>
      </div>
    )
  }

  const isBusy = isSubmitting || isSavingDraft
  const submitLabel = isSubmitting ? '등록 중…' : isSavingDraft ? '저장 중…' : '분양글 등록'

  return (
    <AdoptionPostingForm
      form={form}
      petImages={petImages}
      breedingEnvImages={breedingEnvImages}
      parentRows={parentRows}
      representativeIndex={representativeIndex}
      setRepresentativeIndex={setRepresentativeIndex}
      navTitle="분양글 작성"
      onClose={handleCloseClick}
      eyebrow="새로운 가족을 만나는 첫걸음"
      title="어떤 아이인지 소개해주세요"
      description="사진과 정확한 정보가 입양자의 신중한 선택을 도와요. 작성 중에는 임시저장할 수 있어요."
      onSubmit={handleUpload}
      submitLabel={submitLabel}
      canSubmit={canSubmit}
      isBusy={isBusy}
      onSaveDraft={handleSaveDraft}
      submitError={submitError}
      statusText={
        canSubmit
          ? '필수 정보를 입력했어요. 사진과 내용을 확인한 뒤 등록해주세요.'
          : '필수 항목을 모두 입력하면 등록할 수 있어요. 미완성 글은 임시저장할 수 있어요.'
      }
      overlay={
        <CtaModal
          open={showGuard}
          onOpenChange={(isOpen) => !isOpen && cancelExit()}
          title="분양글 작성을 그만하시겠어요?"
          description="임시저장하면 나중에 이어서 작성할 수 있어요."
          actions={[
            {
              label: '임시저장',
              intent: 'primary',
              onClick: handleSaveDraft,
              disabled: isSavingDraft || isSubmitting,
            },
            {
              label: '분양글 작성 그만하기',
              intent: 'secondary',
              onClick: handleExitConfirm,
              disabled: isSavingDraft || isSubmitting,
            },
            {
              label: '닫기',
              intent: 'ghost',
              onClick: cancelExit,
              disabled: isSavingDraft || isSubmitting,
            },
          ]}
        />
      }
    />
  )
}

export { AdoptionCreateContent }
