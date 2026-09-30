'use client'

import { Button, Container, CtaModal, NavigationBar } from '@/shared/ui'
import { AdoptionPostingForm } from '../../../_ui/AdoptionPostingForm'
import { useAdoptionEditForm } from '../_lib/useAdoptionEditForm'

interface AdoptionEditContentProps {
  petId: string
}

/**
 * 분양글 수정 화면.
 * 작성 화면과 같은 화면 틀(AdoptionFormLayout)·섹션·스키마를 쓰고, 임시저장만 빼고 제출을 PATCH 로 바꾼다.
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

  // 남의 글이면 서버가 막으므로 여기서도 '불러오지 못했습니다' 로 수렴한다
  if (isLoading || isLoadError) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-point-50">
        <NavigationBar
          title="분양글 수정"
          icon="close"
          onBack={handleCloseClick}
          className="bg-transparent"
        />
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
                <Button intent="secondary" size="sm" onClick={handleCloseClick}>
                  돌아가기
                </Button>
                <Button intent="dark" size="sm" onClick={() => void retry()}>
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
    <AdoptionPostingForm
      form={form}
      petImages={petImages}
      breedingEnvImages={breedingEnvImages}
      parentRows={parentRows}
      representativeIndex={representativeIndex}
      setRepresentativeIndex={setRepresentativeIndex}
      navTitle="분양글 수정"
      onClose={handleCloseClick}
      eyebrow="등록한 분양글 수정"
      title="바뀐 정보를 알려주세요"
      description="사진과 정보를 최신으로 유지하면 입양자가 더 정확하게 판단할 수 있어요."
      onSubmit={handleSubmit}
      submitLabel={isSubmitting ? '수정 중…' : '수정 완료'}
      canSubmit={canSubmit}
      isBusy={isSubmitting}
      submitError={submitError}
      statusText={
        canSubmit
          ? '필수 정보를 확인했어요. 바뀐 내용을 확인한 뒤 수정을 완료해주세요.'
          : '필수 항목을 모두 입력하면 수정을 완료할 수 있어요.'
      }
      overlay={
        <CtaModal
          open={showGuard}
          onOpenChange={(isOpen) => !isOpen && cancelExit()}
          title="수정을 그만하시겠어요?"
          description="지금 나가면 고친 내용이 사라져요."
          actions={[
            {
              label: '수정 그만하기',
              intent: 'secondary',
              onClick: handleExitConfirm,
              disabled: isSubmitting,
            },
            {
              label: '계속 수정하기',
              intent: 'ghost',
              onClick: cancelExit,
              disabled: isSubmitting,
            },
          ]}
        />
      }
    />
  )
}

export { AdoptionEditContent }
