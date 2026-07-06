'use client'

import { Controller } from 'react-hook-form'
import { CloseIcon } from '@/shared/assets/icons'
import {
  Container,
  CtaModal,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/ui'
import { ImageUploadArea } from '@/app/(main)/post/create/_ui/ImageUploadArea'
import { useAdoptionCreateForm } from '../_lib/useAdoptionCreateForm'
import { FormFieldLabel } from './FormFieldLabel'
import { HealthInfoSection } from './HealthInfoSection'
import { ParentInfoSection } from './ParentInfoSection'
import { BreedingEnvSection } from './BreedingEnvSection'

const AdoptionCreateContent = () => {
  const {
    form,
    images,
    representativeIndex,
    setRepresentativeIndex,
    handleAddImages,
    handleRemoveImage,
    showGuard,
    cancelExit,
    handleCloseClick,
    handleExitConfirm,
    handleUpload,
    handleSaveDraft,
    isSubmitting,
    error,
  } = useAdoptionCreateForm()

  const { register, control } = form

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      {/* 헤더: X + 제목 */}
      <Container>
        <div className="flex items-center gap-[0.625rem] py-3 tab:justify-between tab:py-6">
          <button type="button" onClick={handleCloseClick}>
            <CloseIcon className="size-5 text-text-primary tab:size-6" />
          </button>
          <p className="text-sm leading-[1.5] font-semibold text-text-primary tab:flex-1 tab:text-center tab:text-xl">
            분양글 작성
          </p>
          {/* 우측 빈 공간 (데스크탑 중앙 정렬용) */}
          <div className="hidden size-6 tab:block" />
        </div>
      </Container>

      {/* 본문 */}
      <Container className="flex-1 pb-24">
        <div className="flex flex-col gap-[1.125rem] tab:flex-row tab:gap-[1.5rem] tab:pt-[5.313rem]">
          {/* 좌측: 이미지 업로드 */}
          <div className="tab:w-[26.256rem] tab:shrink-0">
            <ImageUploadArea
              images={images}
              onAdd={handleAddImages}
              onRemove={handleRemoveImage}
              representativeIndex={representativeIndex}
              onSetRepresentative={setRepresentativeIndex}
            />
          </div>

          {/* 우측: 폼 필드 */}
          <div className="flex flex-1 flex-col gap-3 tab:gap-[1.375rem]">
            <div className="flex flex-col gap-1.5 tab:gap-[1.125rem]">
              <FormFieldLabel label="이름" required />
              <Input placeholder="레오파드게코 도마뱀(만다린).여.6개월" {...register('name')} />
            </div>

            <div className="flex flex-col gap-1.5 tab:gap-[1.125rem]">
              <FormFieldLabel label="품종" required />
              <Input placeholder="레오파드게코 도마뱀(만다린).여.6개월" {...register('breed')} />
            </div>

            <div className="flex flex-col gap-1.5 tab:gap-[1.125rem]">
              <FormFieldLabel label="분양가" required />
              <Input placeholder="20,000원" {...register('price')} />
            </div>

            <div className="flex flex-col gap-1.5 tab:gap-[1.125rem]">
              <FormFieldLabel label="태어난 날짜" required />
              <Input placeholder="생년월일" {...register('birthDate')} />
            </div>

            <div className="flex flex-col gap-1.5 tab:gap-[1.125rem]">
              <FormFieldLabel label="성별" required />
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="성별 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">여자</SelectItem>
                      <SelectItem value="male">남자</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5 tab:gap-[1.125rem]">
              <FormFieldLabel label="아이를 소개해주세요" required />
              <Textarea
                placeholder="생활패턴, 주거환경, 입양 시기 등을 입력해주세요"
                className="h-[5.125rem] tab:h-[6.813rem]"
                {...register('introduction')}
              />
            </div>

            {/* 건강 정보 */}
            <HealthInfoSection control={control} />

            {/* 부모 정보 */}
            <ParentInfoSection control={control} register={register} />

            {/* 사육 환경 */}
            <BreedingEnvSection register={register} />
          </div>
        </div>
      </Container>

      {/* 하단 CTA */}
      <div className="sticky bottom-0 bg-white pb-10 tab:pb-0">
        <Container className="flex flex-col items-end gap-2 py-5 tab:py-[1.438rem]">
          {error && <p className="w-full text-right text-sm text-red-500">{error}</p>}
          <button
            type="button"
            onClick={handleUpload}
            disabled={isSubmitting}
            className="h-12 w-full rounded-full bg-[#d4d4d4] text-base font-semibold text-text-primary disabled:opacity-60 tab:w-[17rem]"
          >
            {isSubmitting ? '업로드 중...' : '업로드'}
          </button>
        </Container>
      </div>

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
