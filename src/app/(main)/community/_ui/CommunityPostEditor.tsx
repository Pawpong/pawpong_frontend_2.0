'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Container } from '@/shared/ui'
import { communityQueries } from '@/entities/community'
import { profileQueries } from '@/entities/profile'
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
import type { CommunityPostDetail, CommunityPostStatus } from '@/shared/types'

interface CommunityPostEditorProps {
  /** 전달하면 수정 모드 — 기존 게시글로 폼을 채운다 */
  postId?: string
}

interface PostFormProps {
  postId?: string
  post?: CommunityPostDetail
}

// [refactored] postId 유무로 갈리던 문구를 모드별 룩업으로 한 곳에 모음
const FORM_TEXT = {
  create: { title: '글 작성', mobileTitle: '게시글 작성', submitLabel: '업로드' },
  edit: { title: '글 수정', mobileTitle: '게시글 수정', submitLabel: '수정 완료' },
} as const

const PostForm = ({ postId, post }: PostFormProps) => {
  const router = useRouter()
  // 임시저장 이어쓰기는 '수정'이 아니라 작성의 연장 — 문구·임시저장 버튼을 작성 화면과 동일하게 둔다
  const isDraft = post?.status === 'draft'
  const isEdit = !!postId && !isDraft
  const formText = FORM_TEXT[isEdit ? 'edit' : 'create']
  const {
    images,
    uploadedImages,
    files,
    text,
    setText,
    textareaRef,
    handleAddImages,
    handleRemoveImage,
    handleEmojiSelect,
  } = usePostForm({ initialText: post?.body ?? '', initialImages: post?.photoUrls ?? [] })

  const [visibility, setVisibility] = useState<VisibilityType>(post?.visibility ?? 'public')
  const { submit, isSubmitting, error } = useSubmitCommunityPostForm(postId)

  // 발행(published)은 본문이 필수, 임시저장(draft)은 본문 없이 사진만으로도 가능 (백엔드 계약)
  const hasBody = text.trim().length > 0
  const canPublish = hasBody && !isSubmitting
  const canSaveDraft = (hasBody || images.length > 0) && !isSubmitting

  // 발행/임시저장 모두 저장 후 마이홈으로 이동 (status 만 다름)
  const save = async (status: CommunityPostStatus) => {
    if (status === 'published' ? !canPublish : !canSaveDraft) return
    const savedId = await submit({
      text,
      files,
      visibility,
      status,
      keptImageUrls: uploadedImages,
    })
    if (savedId) router.push('/home')
  }

  const handleSubmit = () => save('published')
  const handleSaveDraft = () => save('draft')

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PostFormHeader title={formText.title} mobileTitle={formText.mobileTitle} />

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
        // 이미 발행된 글을 임시저장으로 되돌리지는 않는다 (작성 중 / 임시저장 이어쓰기에서만 노출)
        onSaveDraft={isEdit ? undefined : handleSaveDraft}
        onSubmit={handleSubmit}
        submitLabel={formText.submitLabel}
        isValid={canPublish}
        isSaveDraftValid={canSaveDraft}
        isSubmitting={isSubmitting}
        leftSlot={<VisibilitySelect value={visibility} onChange={setVisibility} />}
      />
    </div>
  )
}

/**
 * 게시글 작성/수정 화면.
 * 수정 모드는 조회가 끝난 뒤에 폼을 마운트해 초기값을 시드한다(로드 후 setState 하는 effect 불필요).
 * 남의 글 ID 로 직접 들어오면 폼을 열지 않고 상세로 되돌린다(최종 차단은 백엔드).
 */
const CommunityPostEditor = ({ postId }: CommunityPostEditorProps) => {
  const router = useRouter()
  const { data: post } = useQuery({
    ...communityQueries.detail(postId ?? ''),
    enabled: !!postId,
  })
  // 수정 모드에서만 내 프로필 조회 — 비로그인이면 api client 인터셉터가 /login 으로 보낸다
  const { data: me, isFetched: meFetched } = useQuery({ ...profileQueries.me(), enabled: !!postId })

  const isOwner = !!post && !!me?.userId && me.userId === post.authorId

  useEffect(() => {
    // 판정이 끝났는데 내 글이 아니면 수정 화면을 노출하지 않고 상세로 되돌린다
    if (postId && post && meFetched && !isOwner) router.replace(`/community/${postId}`)
  }, [postId, post, meFetched, isOwner, router])

  if (!postId) return <PostForm />
  if (!post || !isOwner) return null

  return <PostForm postId={postId} post={post} />
}

export { CommunityPostEditor }
