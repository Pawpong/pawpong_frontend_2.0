'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { communityQueries } from '@/entities/community'
import { profileQueries } from '@/entities/profile'
import { useSubmitCommunityPostForm } from '@/features/community'
import { useExitGuard } from '@/shared/lib/useExitGuard'
import { Button, Container, CtaModal, NavigationBar } from '@/shared/ui'
import {
  usePostForm,
  PostFormLayout,
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
  const form = usePostForm({
    initialText: post?.body ?? '',
    initialImages: post?.photoUrls ?? [],
  })

  const initialVisibility = post?.visibility ?? 'public'
  const [visibility, setVisibility] = useState<VisibilityType>(initialVisibility)
  const { submit, isSubmitting, error } = useSubmitCommunityPostForm(postId)
  const hasChanges = form.hasChanges || visibility !== initialVisibility
  const { showGuard, requestExit, confirmExit, cancelExit } = useExitGuard({
    hasChanges,
  })

  // 발행(published)은 본문이 필수, 임시저장(draft)은 본문 없이 사진만으로도 가능 (백엔드 계약)
  const hasBody = form.text.trim().length > 0
  const canPublish = hasBody && !isSubmitting
  const canSaveDraft = (hasBody || form.images.length > 0) && !isSubmitting

  // 발행/임시저장 모두 저장 후 마이홈으로 이동 (status 만 다름)
  const save = async (status: CommunityPostStatus) => {
    if (status === 'published' ? !canPublish : !canSaveDraft) return
    const savedId = await submit({
      text: form.text,
      files: form.files,
      visibility,
      status,
      keptImageUrls: form.uploadedImages,
    })
    if (savedId) {
      cancelExit()
      router.push('/home')
    }
  }

  const handleSubmit = () => save('published')
  const handleSaveDraft = () => save('draft')
  const exitHref = postId ? `/community/post/${postId}` : '/home'
  const handleClose = () => {
    if (requestExit()) router.push(exitHref)
  }
  const handleExitConfirm = () => confirmExit(() => router.push(exitHref))

  return (
    <>
      <PostFormLayout
        title={formText.title}
        mobileTitle={formText.mobileTitle}
        form={form}
        placeholder="입력해보세요"
        error={error}
        onBack={handleClose}
        cta={{
          submitLabel: formText.submitLabel,
          onSubmit: handleSubmit,
          isValid: canPublish,
          // 이미 발행된 글을 임시저장으로 되돌리지는 않는다 (작성 중 / 임시저장 이어쓰기에서만 노출)
          onSaveDraft: isEdit ? undefined : handleSaveDraft,
          isSaveDraftValid: canSaveDraft,
          isSubmitting,
          leftSlot: (
            // Figma 1054-36832: 바 왼쪽 드롭다운 100px.
            // 고정폭이면 '팔로워 공개'가 잘려 최소폭으로 두고 라벨만큼 늘어나게 한다
            <div className="hidden min-w-25 pc:block">
              <VisibilitySelect value={visibility} onChange={setVisibility} />
            </div>
          ),
        }}
        belowContent={
          // 공개 설정 — tab·mo는 본문 아래 풀 너비, PC는 하단 CTA 바 왼쪽(Figma 1054-36832)
          <div className="mt-3 pc:hidden">
            <VisibilitySelect value={visibility} onChange={setVisibility} />
          </div>
        }
      />

      <CtaModal
        open={showGuard}
        onOpenChange={(open) => !open && cancelExit()}
        title={isEdit ? '게시글 수정을 그만하시겠어요?' : '게시글 작성을 그만하시겠어요?'}
        description={
          isEdit ? '수정한 내용은 저장되지 않아요.' : '임시저장하면 나중에 이어서 작성할 수 있어요.'
        }
        actions={[
          ...(!isEdit
            ? [
                {
                  label: '임시저장',
                  variant: 'fill' as const,
                  onClick: handleSaveDraft,
                  disabled: !canSaveDraft || isSubmitting,
                },
              ]
            : []),
          {
            label: isEdit ? '수정 그만하기' : '게시글 작성 그만하기',
            variant: 'outline',
            onClick: handleExitConfirm,
            disabled: isSubmitting,
          },
          { label: '닫기', variant: 'ghost', onClick: cancelExit, disabled: isSubmitting },
        ]}
      />
    </>
  )
}

/**
 * 게시글 작성/수정 화면.
 * 수정 모드는 조회가 끝난 뒤에 폼을 마운트해 초기값을 시드한다(로드 후 setState 하는 effect 불필요).
 * 남의 글 ID 로 직접 들어오면 폼을 열지 않고 상세로 되돌린다(최종 차단은 백엔드).
 */
const CommunityPostEditor = ({ postId }: CommunityPostEditorProps) => {
  const router = useRouter()
  const postQuery = useQuery({
    ...communityQueries.detail(postId ?? ''),
    enabled: !!postId,
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const post = postQuery.data
  // 수정 모드에서만 내 프로필 조회 — 비로그인이면 api client 인터셉터가 /login 으로 보낸다
  const meQuery = useQuery({
    ...profileQueries.me(),
    enabled: !!postId,
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const me = meQuery.data
  const meFetched = meQuery.isFetched

  const isOwner = !!post && !!me?.userId && me.userId === post.authorId

  useEffect(() => {
    // 판정이 끝났는데 내 글이 아니면 수정 화면을 노출하지 않고 상세로 되돌린다
    if (postId && post && meFetched && !isOwner) router.replace(`/community/post/${postId}`)
  }, [postId, post, meFetched, isOwner, router])

  if (!postId) return <PostForm />
  if (postQuery.isPending || meQuery.isPending) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <NavigationBar title="게시글 수정" icon="close" backHref="/home" />
        <Container className="flex flex-1 items-center justify-center px-4 py-10">
          <p role="status" className="text-sm font-medium text-neutral-700">
            게시글을 불러오는 중입니다.
          </p>
        </Container>
      </div>
    )
  }
  if (postQuery.isError || meQuery.isError || !post) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <NavigationBar title="게시글 수정" icon="close" backHref="/home" />
        <Container className="flex flex-1 items-center justify-center px-4 py-10">
          <div role="alert" className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm font-medium text-neutral-700">게시글을 불러오지 못했습니다.</p>
            <Button
              variant="fill"
              size="sm"
              onClick={() => {
                void postQuery.refetch()
                void meQuery.refetch()
              }}
              className="px-4"
            >
              다시 시도
            </Button>
          </div>
        </Container>
      </div>
    )
  }
  if (!isOwner) return null

  return <PostForm postId={postId} post={post} />
}

export { CommunityPostEditor }
