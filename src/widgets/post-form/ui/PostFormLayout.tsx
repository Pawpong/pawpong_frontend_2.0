'use client'

import { useId, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { PHOTO_ACCEPT } from '@/shared/lib/preparePhoto'
import { Button, NavigationBar, ImageUploadArea, TextareaField } from '@/shared/ui'
import type { PostFormState } from '../lib/usePostForm'
import { PostFormCTA, type PostFormCTAProps } from './PostFormCTA'

interface PostFormLayoutProps {
  title: string
  mobileTitle?: string
  form: PostFormState
  placeholder?: string
  maxLength?: number
  beforeContent?: ReactNode
  photoFooter?: ReactNode
  belowContent?: ReactNode
  error?: string | null
  onBack?: () => void
  cta: PostFormCTAProps
}

/** Community composer: one reading column, optional attachments, actions at the bottom. */
const PostFormLayout = ({
  title,
  mobileTitle,
  form,
  placeholder,
  maxLength,
  beforeContent,
  photoFooter,
  belowContent,
  error,
  onBack,
  cta,
}: PostFormLayoutProps) => {
  const router = useRouter()
  const id = useId()
  return (
    <div className="text-neutral-850">
      <NavigationBar
        title={title}
        mobileTitle={mobileTitle}
        icon="close"
        onBack={onBack ?? (() => router.back())}
      />
      <div className="mx-auto max-w-180 space-y-6 tab:space-y-8">
        {beforeContent}
        <section aria-labelledby={`${id}-body-heading`}>
          <h2 id={`${id}-body-heading`} className="sr-only">
            이야기 작성
          </h2>
          <TextareaField
            id={`${id}-body`}
            aria-label="이야기 내용"
            aria-required
            value={form.text}
            disabled={cta.isSubmitting}
            onChange={(event) => form.setText(event.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            currentLength={maxLength === undefined ? undefined : form.text.length}
            variant="composer"
          />
        </section>
        <section
          aria-labelledby={`${id}-photos`}
          className="min-w-0 border-t border-neutral-150 pt-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <h2 id={`${id}-photos`} className="text-body-md font-semibold">
              사진 첨부
            </h2>
            <span className="text-body-sm text-neutral-700">선택 · 최대 {form.maxImages}장</span>
          </div>
          <ImageUploadArea
            size="compact"
            hideLabel
            images={form.images}
            onAdd={form.handleAddImages}
            onRemove={form.handleRemoveImage}
            maxImages={form.maxImages}
            accept={PHOTO_ACCEPT}
            disabled={cta.isSubmitting || form.isProcessingPhotos}
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
          {photoFooter}
        </section>
        {belowContent}
        <div className="border-t border-neutral-150 pt-5">
          <p role="status" className="mb-3 text-sm text-neutral-700">
            {cta.isSubmitting
              ? '사진과 이야기를 저장하고 있어요…'
              : cta.onSaveDraft
                ? '아직 작성 중이라면 임시저장하고 나중에 이어 쓰세요.'
                : '수정한 내용을 확인한 뒤 저장해 주세요.'}
          </p>
          {error && (
            <p role="alert" className="mb-3 text-sm text-error-500">
              {error}
            </p>
          )}
          <PostFormCTA {...cta} placement="inline" />
        </div>
      </div>
    </div>
  )
}

export { PostFormLayout }
