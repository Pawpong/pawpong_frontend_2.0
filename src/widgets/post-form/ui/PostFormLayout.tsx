'use client'

import { useId, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ComposerLayout, ComposerColumns, ComposerSectionHeading, TextareaField } from '@/shared/ui'
import type { PostFormState } from '../lib/usePostForm'
import { ImageUploadArea } from './ImageUploadArea'
import { PostFormCTA, type PostFormCTAProps } from './PostFormCTA'

interface PostFormLayoutProps {
  title: string
  mobileTitle?: string
  introTitle: string
  introDescription: string
  form: PostFormState
  placeholder?: string
  maxLength?: number
  belowContent?: ReactNode
  error?: string | null
  onBack?: () => void
  cta: PostFormCTAProps
}

/** Community create/edit composer. Shared textarea defaults and photo actions are
 * preserved; the Hall of Fame surface groups the form and its actions together. */
const PostFormLayout = ({
  title,
  mobileTitle,
  introTitle,
  introDescription,
  form,
  placeholder,
  maxLength,
  belowContent,
  error,
  onBack,
  cta,
}: PostFormLayoutProps) => {
  const router = useRouter()
  const id = useId()
  return (
    <ComposerLayout
      title={title}
      mobileTitle={mobileTitle}
      introTitle={introTitle}
      description={introDescription}
      onBack={onBack ?? (() => router.back())}
    >
      <ComposerColumns>
        <section aria-labelledby={`${id}-photos`} className="min-w-0">
          <ComposerSectionHeading
            id={`${id}-photos`}
            step={1}
            trailing={`${form.images.length}/${form.maxImages}`}
          >
            사진으로 담은 순간
          </ComposerSectionHeading>
          <ImageUploadArea
            size="composer"
            hideLabel
            images={form.images}
            onAdd={form.handleAddImages}
            onRemove={form.handleRemoveImage}
            maxImages={form.maxImages}
            disabled={cta.isSubmitting}
          />
          <p className="mt-3 text-xs leading-relaxed text-neutral-700">
            사진은 최대 {form.maxImages}장까지 올릴 수 있어요. 사진 없이 글만 작성해도 좋아요.
          </p>
        </section>
        <section aria-labelledby={`${id}-body-heading`} className="flex min-w-0 flex-col gap-6">
          <div>
            <ComposerSectionHeading
              id={`${id}-body-heading`}
              step={2}
              required
              htmlFor={`${id}-body`}
            >
              들려주고 싶은 이야기
            </ComposerSectionHeading>
            <TextareaField
              id={`${id}-body`}
              aria-required
              value={form.text}
              disabled={cta.isSubmitting}
              onChange={(event) => form.setText(event.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              currentLength={maxLength === undefined ? undefined : form.text.length}
              aria-describedby={`${id}-hint`}
            />
            <p id={`${id}-hint`} className="mt-2 text-xs leading-relaxed text-neutral-700">
              소소한 일상부터 궁금한 점까지, 편하게 남겨주세요.
            </p>
          </div>
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
        </section>
      </ComposerColumns>
    </ComposerLayout>
  )
}

export { PostFormLayout }
