'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Container, NavigationBar, TextareaField, TextLabel } from '@/shared/ui'
import type { PostFormState } from '../lib/usePostForm'
import { ImageUploadArea } from './ImageUploadArea'
import { PostFormCTA, type PostFormCTAProps } from './PostFormCTA'

interface PostFormLayoutProps {
  /** 상단바 제목 (tab+) */
  title: string
  /** mo 에서만 다른 제목을 쓸 때 */
  mobileTitle?: string
  /** usePostForm 반환 그대로 — 이미지·본문 상태와 핸들러가 한 묶음으로 다닌다 */
  form: PostFormState
  placeholder?: string
  /** 서버 계약상 길이 제한이 있을 때만 — 지정하면 글자 수 카운터가 붙는다 */
  maxLength?: number
  /** 본문 아래 추가 영역 (공개 설정 등) */
  belowContent?: ReactNode
  error?: string | null
  /** 하단 CTA — PostFormCTA 로 그대로 전달 */
  cta: PostFormCTAProps
}

/**
 * 작성 폼 공통 셸 — 상단바 + 이미지·본문 2단 + 하단 CTA.
 *
 * 게시글 작성/수정과 콘테스트 참여가 같은 레이아웃을 쓰고 제목·본문 문구·제출 로직만 다르다.
 * Figma 1056-46147(PC) / 1056-46891(tab·mo): 1440 화면에서 이미지 372 + 본문 2단(gap 100).
 */
const PostFormLayout = ({
  title,
  mobileTitle,
  form,
  placeholder,
  maxLength,
  belowContent,
  error,
  cta,
}: PostFormLayoutProps) => {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Figma 976-25818 navigation bar — 작성 화면이라 선두 아이콘은 닫기 */}
      <NavigationBar
        title={title}
        mobileTitle={mobileTitle}
        icon="close"
        onBack={() => router.back()}
      />

      <Container className="flex-1 py-5 pb-30 pc:py-12">
        <div className="mx-auto w-full pc:max-w-320">
          <div className="flex flex-col gap-[1.1875rem] pc:flex-row pc:gap-25">
            <div className="flex flex-col gap-1 pc:w-93 pc:shrink-0 pc:gap-2">
              <TextLabel size="14" requirement="선택">
                이미지
              </TextLabel>
              <ImageUploadArea
                size="post"
                hideLabel
                images={form.images}
                onAdd={form.handleAddImages}
                onRemove={form.handleRemoveImage}
                maxImages={form.maxImages}
              />
            </div>

            {/* 본문 입력 높이: tab·mo 105(Textarea 기본) / PC 180 */}
            <TextareaField
              label="게시글"
              required
              value={form.text}
              onChange={(event) => form.setText(event.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              currentLength={maxLength === undefined ? undefined : form.text.length}
              wrapperClassName="pc:flex-1"
              className="pc:h-45"
            />
          </div>

          {belowContent}

          {error && <p className="mt-3 text-sm text-error-500">{error}</p>}
        </div>
      </Container>

      <PostFormCTA {...cta} />
    </div>
  )
}

export { PostFormLayout }
