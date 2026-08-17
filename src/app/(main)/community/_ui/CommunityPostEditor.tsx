'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Container, TextareaField, TextLabel } from '@/shared/ui'
import { communityQueries } from '@/entities/community'
import { profileQueries } from '@/entities/profile'
import { useSubmitCommunityPostForm } from '@/features/community'
import {
  usePostForm,
  PostFormHeader,
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

      {/* Figma 1056-46147(PC) / 1056-46891(tab·mo): PC는 이미지 372 + 본문 2단(gap 100), 그 아래는 세로 스택 */}
      <Container className="flex-1 py-5 pb-[7.5rem] pc:py-12">
        {/* PC 콘텐츠 폭 1280 고정 (1440 - 좌우 80) */}
        <div className="mx-auto w-full pc:max-w-320">
          <div className="flex flex-col gap-[1.1875rem] pc:flex-row pc:gap-25">
            <div className="flex flex-col gap-1 pc:w-93 pc:shrink-0 pc:gap-2">
              <TextLabel size="14" requirement="선택">
                이미지
              </TextLabel>
              <ImageUploadArea
                size="post"
                hideLabel
                images={images}
                onAdd={handleAddImages}
                onRemove={handleRemoveImage}
              />
            </div>

            {/* 본문 입력 높이: tab·mo 105(Textarea 기본) / PC 180 */}
            <TextareaField
              ref={textareaRef}
              label="게시글"
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="입력해보세요"
              wrapperClassName="pc:flex-1"
              className="pc:h-45"
            />
          </div>

          {/* 공개 설정 — tab·mo는 본문 아래 풀 너비, PC는 하단 CTA 바 왼쪽(Figma 1054-36832) */}
          <div className="mt-3 pc:hidden">
            <VisibilitySelect value={visibility} onChange={setVisibility} />
          </div>

          {error && <p className="mt-3 text-sm text-error-500">{error}</p>}
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
        leftSlot={
          // Figma 1054-36832: 바 왼쪽 드롭다운 100px.
          // 고정폭이면 '팔로워 공개'가 잘려 최소폭으로 두고 라벨만큼 늘어나게 한다
          <div className="hidden min-w-25 pc:block">
            <VisibilitySelect value={visibility} onChange={setVisibility} />
          </div>
        }
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
