'use client'

import { useRouter } from 'next/navigation'
import { useSubmitContestEntryForm } from '@/features/contest'
import { usePostForm, PostFormLayout } from '@/widgets/post-form'

/** 서버 계약: description 최대 200자, 사진 1장 */
const MAX_DESCRIPTION = 200

const ContestEntryContent = () => {
  const router = useRouter()
  const form = usePostForm({ maxImages: 1 })
  const { submit, isSubmitting, error } = useSubmitContestEntryForm()

  const file = form.files[0]
  const isValid = form.text.trim().length > 0 && !!file && !isSubmitting

  const handleSubmit = async () => {
    if (!isValid) return
    const entryId = await submit({ file, description: form.text })
    if (entryId) router.push('/hall-of-fame')
  }

  return (
    <PostFormLayout
      title="명예의 전당 콘테스트 참여하기"
      mobileTitle="콘테스트 참여"
      form={form}
      placeholder="귀여운 파이리"
      maxLength={MAX_DESCRIPTION}
      error={error}
      cta={{ submitLabel: '참여하기', onSubmit: handleSubmit, isValid, isSubmitting }}
    />
  )
}

export { ContestEntryContent }
