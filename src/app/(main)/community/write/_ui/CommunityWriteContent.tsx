'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/shared/ui'
import { useSubmitCommunityPostForm } from '@/features/community'
import {
  usePostForm,
  PostFormHeader,
  PostFormTextArea,
  PostFormToolbar,
  PostFormCTA,
  ImageUploadArea,
  VisibilitySelect,
  type VisibilityType,
} from '@/widgets/post-form'

const CommunityWriteContent = () => {
  const router = useRouter()
  const {
    images,
    files,
    text,
    setText,
    textareaRef,
    handleAddImages,
    handleRemoveImage,
    handleEmojiSelect,
  } = usePostForm()

  const [visibility, setVisibility] = useState<VisibilityType>('public')
  const { submit, isSubmitting, error } = useSubmitCommunityPostForm()

  const hasContent = text.trim().length > 0 || images.length > 0
  const isValid = hasContent && !isSubmitting

  // 발행: 커뮤니티 피드에 노출되는 정식 게시글로 등록 후 상세로 이동
  const handleSubmit = async () => {
    if (!hasContent || isSubmitting) return
    const postId = await submit({ text, files, visibility, status: 'published' })
    if (postId) router.push(`/community/${postId}`)
  }

  // 임시저장: draft 로 저장 후 커뮤니티 피드로 이동 (작성 중이던 내용 보존)
  const handleSaveDraft = async () => {
    if (!hasContent || isSubmitting) return
    const postId = await submit({ text, files, visibility, status: 'draft' })
    if (postId) router.push('/community')
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PostFormHeader title="글 작성" mobileTitle="게시글 작성" />

      <Container className="flex-1 pt-[0.719rem] pb-[7.5rem] tab:px-[6.25rem] tab:pt-[5.5rem]">
        <div className="flex flex-col gap-[1.125rem] tab:flex-row tab:gap-0">
          <div className="tab:w-[26.256rem] tab:shrink-0">
            <ImageUploadArea images={images} onAdd={handleAddImages} onRemove={handleRemoveImage} />
          </div>

          <div className="flex flex-1 flex-col tab:ml-[2.5rem]">
            <div className="flex flex-col gap-[0.375rem] tab:gap-[1.125rem]">
              <PostFormTextArea
                ref={textareaRef}
                value={text}
                onChange={setText}
                placeholder="귀여운 동물을 자랑해보세요"
              />
              <PostFormToolbar onEmojiSelect={handleEmojiSelect} />
            </div>

            <div className="mt-[1.125rem] tab:hidden">
              <VisibilitySelect value={visibility} onChange={setVisibility} />
            </div>

            {error && <p className="mt-[0.75rem] text-sm text-red-500">{error}</p>}
          </div>
        </div>
      </Container>

      <PostFormCTA
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
        submitLabel="업로드"
        isValid={isValid}
        isSubmitting={isSubmitting}
        leftSlot={<VisibilitySelect value={visibility} onChange={setVisibility} />}
      />
    </div>
  )
}

export { CommunityWriteContent }
