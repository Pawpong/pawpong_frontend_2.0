'use client'

import { useId, useRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ImageLineIcon } from '@/shared/assets'
import { PHOTO_ACCEPT } from '@/shared/lib/preparePhoto'
import { Button, NavigationBar, ImageUploadArea, TextareaField } from '@/shared/ui'
import type { PostFormState } from '../lib/usePostForm'
import type { PostFormCTAProps } from './PostFormCTA'

interface PostFormLayoutProps {
  title: string
  mobileTitle?: string
  form: PostFormState
  placeholder?: string
  maxLength?: number
  /** 본문 위 한 줄 (분류) */
  beforeContent?: ReactNode
  /** 본문 바로 아래 (태그) */
  photoFooter?: ReactNode
  /** 본문 아래 안내 (설정 확인·사진 복구 등) */
  belowContent?: ReactNode
  /** 하단 도구 모음에서 '사진' 뒤에 이어지는 버튼들 (장소·AI 꾸미기·공개 범위) — 각자 그 자리에서 시트·팝오버를 연다 */
  toolbar?: ReactNode
  /** 올리기 버튼 바로 위 확인 한 줄 (AI 처리 동의) */
  confirm?: ReactNode
  error?: string | null
  onBack?: () => void
  cta: PostFormLayoutCta
}

// 고정 바(PostFormCTA)와 같은 동작 props 를 쓰되, 바 전용(leftSlot·className)은 받지 않고
// 올리기 문구는 화면마다 달라 꼭 받는다
type PostFormLayoutCta = Omit<PostFormCTAProps, 'leftSlot' | 'className' | 'submitLabel'> & {
  submitLabel: string
}

/**
 * 커뮤니티 글 작성 — 한 화면에 사진 → 본문 → 태그, 나머지는 하단 도구 모음에서 그 자리에서 연다.
 * 임시저장은 상단 바 오른쪽, 올리기는 하단 고정 줄 맨 아래.
 */
const PostFormLayout = ({
  title,
  mobileTitle,
  form,
  placeholder,
  maxLength,
  beforeContent,
  photoFooter,
  belowContent,
  toolbar,
  confirm,
  error,
  onBack,
  cta,
}: PostFormLayoutProps) => {
  const router = useRouter()
  const id = useId()
  const isSubmitting = cta.isSubmitting ?? false
  const photoInput = useRef<HTMLInputElement>(null)
  const photoDisabled =
    isSubmitting || form.isProcessingPhotos || form.images.length >= form.maxImages
  return (
    // flex-1: 본문이 짧아도 화면 높이를 채워 아래 고정 줄이 화면 맨 아래에 붙는다
    <div className="flex flex-1 flex-col text-neutral-850">
      <NavigationBar
        title={title}
        mobileTitle={mobileTitle}
        icon="close"
        titleAlign="start"
        gap="tight"
        onBack={onBack ?? (() => router.back())}
        right={
          cta.onSaveDraft && (
            <Button
              intent="link"
              size="inline"
              onClick={cta.onSaveDraft}
              disabled={cta.isSaveDraftValid === false || isSubmitting}
            >
              임시저장
            </Button>
          )
        }
      />
      <div className="mb-6 space-y-5">
        {beforeContent}
        <section aria-labelledby={`${id}-photos`}>
          <h2 id={`${id}-photos`} className="sr-only">
            사진 첨부 · 최대 {form.maxImages}장
          </h2>
          <ImageUploadArea
            size="compact"
            hideLabel
            images={form.images}
            onAdd={form.handleAddImages}
            onRemove={form.handleRemoveImage}
            maxImages={form.maxImages}
            accept={PHOTO_ACCEPT}
            disabled={isSubmitting || form.isProcessingPhotos}
          />
          {form.isProcessingPhotos && (
            <div className="mt-3 flex items-center gap-2">
              <p role="status" className="text-sm text-neutral-700">
                사진을 준비하고 있어요…
              </p>
              <Button
                type="button"
                intent="ghost"
                onClick={form.cancelPhotoProcessing}
                size="inline"
              >
                사진 처리 취소
              </Button>
            </div>
          )}
          {form.photoError && (
            <p role="alert" className="mt-3 text-sm whitespace-pre-line text-error-500">
              {form.photoError}
            </p>
          )}
        </section>
        <section aria-labelledby={`${id}-body-heading`}>
          <h2 id={`${id}-body-heading`} className="sr-only">
            이야기 작성
          </h2>
          <TextareaField
            id={`${id}-body`}
            aria-label="이야기 내용"
            aria-required
            value={form.text}
            disabled={isSubmitting}
            onChange={(event) => form.setText(event.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            currentLength={maxLength === undefined ? undefined : form.text.length}
            variant="composer"
          />
          {photoFooter}
        </section>
        {belowContent}
      </div>

      {/* 하단 고정 줄 — 도구 모음 · 확인 한 줄 · 올리기. 본문이 길어져도 손이 닿는 자리에 둔다 */}
      <div
        data-page-bottom
        className="sticky bottom-0 z-sticky mt-auto border-t border-neutral-150 bg-white pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-5">
            {/* 사진 칸의 추가 타일과 같은 일을 한다 — 본문을 쓰다 손이 아래에 있을 때 바로 고르게 */}
            <Button
              intent="bare"
              size="xs"
              onClick={() => photoInput.current?.click()}
              disabled={photoDisabled}
            >
              <ImageLineIcon className="size-5 text-primary-500" />
              사진 {form.images.length}/{form.maxImages}
            </Button>
            <input
              ref={photoInput}
              type="file"
              accept={PHOTO_ACCEPT}
              multiple
              hidden
              onChange={(event) => {
                if (event.target.files?.length) form.handleAddImages(event.target.files)
                event.target.value = ''
              }}
            />
            {toolbar}
          </div>
          {confirm}
          {isSubmitting && (
            <p role="status" className="text-sm text-neutral-700">
              사진과 이야기를 저장하고 있어요…
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-error-500">
              {error}
            </p>
          )}
          <Button
            size="lg"
            onClick={cta.onSubmit}
            disabled={!cta.isValid || isSubmitting}
            width="full"
          >
            {isSubmitting ? '저장 중…' : cta.submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { PostFormLayout }
