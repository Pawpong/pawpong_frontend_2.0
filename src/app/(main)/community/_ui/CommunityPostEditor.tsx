'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  communityQueries,
  communityReviewConfigOptions,
  takePendingCommunityCard,
} from '@/entities/community'
import { useAuthSessionGeneration } from '@/shared/lib/useAuthSessionGeneration'
import { getAuthSessionGeneration, isAuthSessionCurrent } from '@/shared/lib/authSessionLifecycle'
import { CommunityReviewConsent } from './CommunityReviewConsent'
import {
  communityExperienceConfigOptions,
  communityWritingPrompt,
  initialCommunityExperience,
  isCommunityExperienceEmpty,
  prepareCommunityExperience,
  validateCommunityExperience,
  type CommunityExperience,
} from '@/entities/community'
import { CommunityExperienceEditor } from './CommunityExperienceEditor'
import { profileQueries } from '@/entities/profile'
import Link from 'next/link'
import {
  takePendingCommunityPost,
  PostAiComparisonEditor,
  usePostAiComparison,
} from '@/features/ai-image'
import {
  PetCategorySuggestion,
  communityCreateSignature,
  diffCommunityAutoApplied,
  nextCommunityCreateAttempt,
  rememberCommunityAutoApplied,
  useSubmitCommunityPostForm,
  type CommunityCreateAttempt,
} from '@/features/community'
import { useExitGuard } from '@/shared/lib/useExitGuard'
import { RetryButton, Container, CtaModal, NavigationBar } from '@/shared/ui'
import {
  usePostForm,
  PostFormLayout,
  VisibilitySelect,
  type VisibilityType,
} from '@/widgets/post-form'
import type { CommunityPetType, CommunityPostDetail, CommunityPostStatus } from '@/shared/types'

interface CommunityPostEditorProps {
  /** 전달하면 수정 모드 — 기존 게시글로 폼을 채운다 */
  postId?: string
  /** 새 글에서 처음 열어 둘 기록 틀 (walk | clinic | daily) */
  initialRecord?: string
  photoSource?: 'memory-card'
}

interface PostFormProps {
  postId?: string
  initialRecord?: string
  photoSource?: 'memory-card'
  post?: CommunityPostDetail
}

// [refactored] postId 유무로 갈리던 문구를 모드별 룩업으로 한 곳에 모음
const FORM_TEXT = {
  create: { title: '글 작성', mobileTitle: '게시글 작성', submitLabel: '이야기 올리기' },
  edit: { title: '글 수정', mobileTitle: '게시글 수정', submitLabel: '수정 완료' },
} as const

const PostForm = ({ postId, post, initialRecord, photoSource }: PostFormProps) => {
  const router = useRouter()
  // 임시저장 이어쓰기는 '수정'이 아니라 작성의 연장 — 문구·임시저장 버튼을 작성 화면과 동일하게 둔다
  const isDraft = post?.status === 'draft'
  const isEdit = !!postId && !isDraft
  const formText = FORM_TEXT[isEdit ? 'edit' : 'create']
  // 명시적으로 넘긴 사진만 새 글에 한 번 붙인다. 기존 글·초안을 덮어쓰지 않는다.
  const [handoff] = useState(() => {
    if (post) return null
    const aiPhoto = takePendingCommunityPost()
    const card = takePendingCommunityCard(photoSource)
    if (photoSource === 'memory-card')
      return card ? { files: [card], aiComparison: null, jobId: undefined } : null
    return aiPhoto
  })
  const isMemoryCardHandoff = photoSource === 'memory-card' && !!handoff
  const initialComparison = post?.aiComparison ?? handoff?.aiComparison
  const form = usePostForm({
    maxImages: 10,
    initialText: post?.body ?? '',
    initialImages: post?.photoUrls ?? [],
    initialFiles: handoff?.files,
  })
  const currentPhotos: (string | File)[] = [...form.uploadedImages, ...form.files]
  const comparison = usePostAiComparison(currentPhotos, initialComparison, handoff?.jobId)

  const visiblePhotoIndexes = currentPhotos.flatMap((photo, index) =>
    comparison.choice.sources.includes(photo) ? [] : [index],
  )
  const visibleForm = {
    ...form,
    images: visiblePhotoIndexes.map((index) => form.images[index]),
    maxImages: comparison.choice.enabled ? 9 : 10,
    handleRemoveImage: (index: number) => form.handleRemoveImage(visiblePhotoIndexes[index]),
  }

  const initialVisibility = post?.visibility ?? 'public'
  const [visibility, setVisibility] = useState<VisibilityType>(initialVisibility)
  const initialPetType = post?.petType ?? ''
  const [petType, setPetType] = useState<CommunityPetType | ''>(initialPetType)
  const experienceConfig = useQuery(communityExperienceConfigOptions)
  const reviewConfig = useQuery(communityReviewConfigOptions)
  const reviewEnabled = reviewConfig.data?.enabled === true && !reviewConfig.isError
  const [aiReviewConsent, setAiReviewConsent] = useState(false)
  // 수정·임시저장 이어쓰기는 저장된 값을 쓰고, 새 글만 링크가 고른 기록 틀로 시작한다.
  const [startExperience] = useState<CommunityExperience | null | undefined>(() =>
    post ? post.experience : initialCommunityExperience(initialRecord),
  )
  const [experience, setExperience] = useState(startExperience)
  const experienceEnabled = experienceConfig.data?.enabled === true && !experienceConfig.isError
  const experienceNotice =
    experienceEnabled && experience ? validateCommunityExperience(experience) : null
  const experienceValid = !experienceNotice
  const { submit, isSubmitting, error } = useSubmitCommunityPostForm(postId)
  // 같은 내용으로 다시 올리면 같은 저장 식별자를 써서 글이 두 번 생기지 않게 한다.
  const createAttempt = useRef<CommunityCreateAttempt | null>(null)
  const hasChanges =
    form.hasChanges ||
    comparison.hasChanges ||
    JSON.stringify(experience) !== JSON.stringify(startExperience) ||
    visibility !== initialVisibility ||
    petType !== initialPetType
  const { showGuard, requestExit, confirmExit, cancelExit } = useExitGuard({
    hasChanges,
  })

  // 발행(published)은 본문이 필수, 임시저장(draft)은 본문 없이 사진만으로도 가능 (백엔드 계약)
  const hasBody = form.text.trim().length > 0
  const canPublish =
    experienceValid &&
    hasBody &&
    !isSubmitting &&
    !form.isProcessingPhotos &&
    !comparison.busy &&
    !comparison.submission.error
  const canSaveDraft =
    experienceValid &&
    (hasBody || form.images.length > 0) &&
    !isSubmitting &&
    !form.isProcessingPhotos &&
    !comparison.busy &&
    !comparison.submission.error

  // 발행/임시저장 모두 저장 후 마이홈으로 이동 (status 만 다름)
  const save = async (status: CommunityPostStatus) => {
    if (
      form.hasPendingPhotos() ||
      comparison.hasPending() ||
      (status === 'published' ? !canPublish : !canSaveDraft)
    )
      return
    const generation = getAuthSessionGeneration()
    // 비운 경험은 새 글에서는 보내지 않고, 고치는 글에서는 지웠다고 알린다.
    const submittedExperience =
      !experienceEnabled || experience === undefined
        ? undefined
        : experience && !isCommunityExperienceEmpty(experience)
          ? prepareCommunityExperience(experience)
          : post?.experience
            ? null
            : undefined
    const petTypeToSend = petType || (postId ? null : undefined)
    if (!postId && reviewEnabled && status === 'published')
      createAttempt.current = nextCommunityCreateAttempt(
        createAttempt.current,
        communityCreateSignature(
          [
            form.text.trim(),
            visibility,
            petTypeToSend,
            aiReviewConsent,
            submittedExperience,
            comparison.submission.aiComparison,
            comparison.submission.keptImageUrls,
          ],
          comparison.submission.files,
        ),
      )
    const saved = await submit({
      ...(!postId && reviewEnabled && status === 'published' && createAttempt.current
        ? { createAttempt: createAttempt.current }
        : {}),
      ...(reviewEnabled ? { useOwnedPhotoUpload: true } : {}),
      ...(reviewEnabled && status === 'published' ? { aiReviewConsent } : {}),
      ...(submittedExperience !== undefined ? { experience: submittedExperience } : {}),
      text: form.text,
      files: comparison.submission.files,
      visibility,
      status,
      petType: petTypeToSend,
      aiComparison: comparison.submission.aiComparison,
      keptImageUrls: comparison.submission.keptImageUrls,
    })
    if (saved && isAuthSessionCurrent(generation)) {
      if (status === 'published')
        rememberCommunityAutoApplied(
          saved.postId,
          diffCommunityAutoApplied(submittedExperience ?? post?.experience, saved.experience),
        )
      cancelExit()
      router.push(saved.aiReview ? `/community/post/${saved.postId}` : '/home')
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
        form={visibleForm}
        introTitle={isEdit ? '우리 아이의 이야기를 다듬어주세요' : '우리 아이의 일상을 나눠주세요'}
        introDescription="함께 웃고, 궁금한 것을 묻고, 반려동물과의 소중한 순간을 기록해요."
        placeholder={
          (experienceEnabled && communityWritingPrompt(experience)) ||
          '오늘 우리 아이는 어떤 하루를 보냈나요?'
        }
        error={error}
        onBack={handleClose}
        cta={{
          submitLabel: reviewEnabled
            ? aiReviewConsent
              ? '심사 후 이야기 올리기'
              : '나만 확인하며 저장하기'
            : formText.submitLabel,
          onSubmit: handleSubmit,
          isValid: canPublish,
          // 이미 발행된 글을 임시저장으로 되돌리지는 않는다 (작성 중 / 임시저장 이어쓰기에서만 노출)
          onSaveDraft: isEdit ? undefined : handleSaveDraft,
          isSaveDraftValid: canSaveDraft,
          isSubmitting,
        }}
        belowContent={
          <div className="flex flex-col gap-4">
            {reviewEnabled && reviewConfig.data && (
              <CommunityReviewConsent
                config={reviewConfig.data}
                consent={aiReviewConsent}
                onChange={setAiReviewConsent}
                disabled={isSubmitting || form.isProcessingPhotos}
              />
            )}
            {experienceEnabled && experienceConfig.data && (
              <CommunityExperienceEditor
                value={experience}
                onChange={setExperience}
                config={experienceConfig.data}
                disabled={isSubmitting || form.isProcessingPhotos}
                autoTagging={reviewEnabled ? (aiReviewConsent ? 'on' : 'consent') : 'off'}
                error={experienceNotice}
              />
            )}
            {isMemoryCardHandoff ? (
              <div className="rounded-xl border border-primary-200 bg-point-50 p-4">
                <p className="text-sm font-bold text-primary-700">완성한 추억 카드를 담았어요</p>
                <p className="mt-1 text-xs text-neutral-700">
                  카드와 함께 기억하고 싶은 오늘의 이야기를 남겨 주세요.
                </p>
              </div>
            ) : (
              <Link
                href="/ai-filter"
                className="flex items-center justify-between gap-3 rounded-xl border border-primary-200 bg-point-50 p-4 focus-ring transition-colors hover:bg-point-100"
              >
                <span>
                  <span className="block text-sm font-bold text-primary-700">
                    {handoff ? 'AI 필터로 만든 사진을 담았어요' : 'AI 필터로 사진 꾸미기'}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-700">
                    도트 그림·스티커·수채화로 바꿔 올리면 좋아요를 더 받을지도 몰라요
                  </span>
                </span>
                <span aria-hidden className="text-lg text-primary-700">
                  →
                </span>
              </Link>
            )}
            {!isMemoryCardHandoff && (
              <PostAiComparisonEditor
                editor={comparison}
                photos={currentPhotos}
                disabled={isSubmitting || form.isProcessingPhotos}
              />
            )}
            <PetCategorySuggestion
              automaticAllowed={
                !reviewConfig.isPending &&
                !reviewConfig.isError &&
                (!reviewEnabled || aiReviewConsent)
              }
              text={form.text}
              photo={form.files[0]}
              value={petType}
              onChange={setPetType}
              disabled={isSubmitting || form.isProcessingPhotos}
            />
            <div className="rounded-xl bg-neutral-50 p-5">
              <h3 className="mb-2 text-sm font-semibold">누구와 나눌까요?</h3>
              <p className="mb-3 text-xs leading-relaxed text-neutral-700">
                {visibility === 'followers'
                  ? '나를 팔로우하는 사람들에게만 보여요.'
                  : visibility === 'private'
                    ? '이 글은 나에게만 보여요.'
                    : '포퐁을 방문하는 누구나 볼 수 있어요.'}
              </p>
              <VisibilitySelect
                value={visibility}
                onChange={setVisibility}
                disabled={isSubmitting}
              />
            </div>
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
                  intent: 'primary' as const,
                  onClick: handleSaveDraft,
                  disabled: !canSaveDraft || isSubmitting,
                },
              ]
            : []),
          {
            label: isEdit ? '수정 그만하기' : '게시글 작성 그만하기',
            intent: 'secondary',
            onClick: handleExitConfirm,
            disabled: isSubmitting,
          },
          { label: '닫기', intent: 'ghost', onClick: cancelExit, disabled: isSubmitting },
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
const CommunityPostEditor = ({ postId, initialRecord, photoSource }: CommunityPostEditorProps) => {
  const router = useRouter()
  const generation = useAuthSessionGeneration()
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

  if (!postId)
    return <PostForm key={generation} initialRecord={initialRecord} photoSource={photoSource} />
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
            <RetryButton
              onRetry={() => {
                void postQuery.refetch()
                void meQuery.refetch()
              }}
              isRetrying={postQuery.isFetching || meQuery.isFetching}
            />
          </div>
        </Container>
      </div>
    )
  }
  if (!isOwner) return null

  return <PostForm key={`${postId}:${generation}`} postId={postId} post={post} />
}

export { CommunityPostEditor }
