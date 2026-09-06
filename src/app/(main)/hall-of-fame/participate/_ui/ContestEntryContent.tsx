'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSubmitContestEntryForm } from '@/features/contest'
import { PawIcon, CheckIcon } from '@/shared/assets'
import { Button, Container, CtaModal, NavigationBar, TextareaField } from '@/shared/ui'
import { PhotoUploadField } from '@/shared/ui/PhotoUploadField'
import { preparePhoto } from '@/shared/lib/preparePhoto'
import { useExitGuard } from '@/shared/lib/useExitGuard'

const MAX_DESCRIPTION = 200

const ContestEntryContent = () => {
  const router = useRouter()
  const [photo, setPhoto] = useState<{ file: File; url: string }>()
  const [text, setText] = useState('')
  const [preparing, setPreparing] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const operation = useRef(0)
  const preparingRef = useRef(false)
  const submittingRef = useRef(false)
  const { submit, isSubmitting, error } = useSubmitContestEntryForm()
  const { showGuard, requestExit, confirmExit, cancelExit } = useExitGuard({
    hasChanges: !!photo || text.length > 0 || preparing,
    enabled: !completed,
  })
  useEffect(
    () => () => {
      operation.current += 1
    },
    [],
  )
  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo.url)
    },
    [photo],
  )

  const selectPhoto = async (files: FileList) => {
    if (preparingRef.current || submittingRef.current || !files.length) return
    if (files.length > 1) {
      setPhotoError('콘테스트에는 사진 1장만 선택해 주세요.')
      return
    }
    const current = ++operation.current
    preparingRef.current = true
    setPreparing(true)
    setPhotoError(null)
    try {
      const file = await preparePhoto(files[0])
      if (current === operation.current) setPhoto({ file, url: URL.createObjectURL(file) })
    } catch (err) {
      if (current === operation.current)
        setPhotoError(
          err instanceof Error ? err.message : '사진을 준비하지 못했습니다. 다시 선택해 주세요.',
        )
    } finally {
      if (current === operation.current) {
        preparingRef.current = false
        setPreparing(false)
      }
    }
  }
  const isValid =
    !!photo &&
    text.trim().length > 0 &&
    text.length <= MAX_DESCRIPTION &&
    !preparing &&
    !isSubmitting &&
    !completed
  const handleSubmit = async () => {
    if (!isValid || !photo || submittingRef.current || preparingRef.current) return
    submittingRef.current = true
    try {
      const entryId = await submit({ file: photo.file, description: text })
      if (entryId) {
        setCompleted(true)
        router.replace('/hall-of-fame')
      }
    } finally {
      submittingRef.current = false
    }
  }
  const exit = () => {
    if (!isSubmitting && requestExit()) router.push('/hall-of-fame')
  }

  return (
    <div className="min-h-dvh bg-white text-neutral-850">
      <NavigationBar
        title="명예의 전당 콘테스트 참여"
        mobileTitle="콘테스트 참여"
        icon="close"
        onBack={exit}
      />
      <Container className="py-5 pb-10 tab:py-8 pc:py-10">
        <div className="mx-auto max-w-264">
          <header className="relative mb-6 overflow-hidden rounded-xl bg-point-100 px-5 py-6 tab:mb-8 tab:px-8 tab:py-8">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-600">
              <PawIcon className="size-5" /> 명예의 전당
            </p>
            <h1 className="text-2xl leading-snug font-bold tracking-tight tab:text-3xl">
              우리 아이의 매력을
              <br className="tab:hidden" /> 모두에게 보여주세요
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-700 tab:text-base">
              사진 한 장과 짧은 소개로 시작하는 우리 아이의 특별한 순간.
            </p>
            <PawIcon
              aria-hidden="true"
              className="pointer-events-none absolute right-8 bottom-5 hidden size-24 -rotate-12 text-point-300 pc:block"
            />
          </header>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void handleSubmit()
            }}
          >
            <div className="grid gap-8 tab:grid-cols-2 tab:gap-8 pc:grid-cols-[420px_1fr] pc:gap-12">
              <section aria-labelledby="photo-heading" className="min-w-0">
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-600">
                    1
                  </span>
                  <h2 id="photo-heading" className="text-base font-semibold">
                    대표 사진
                  </h2>
                  <span className="text-xs text-primary-600">필수</span>
                </div>
                <PhotoUploadField
                  preview={photo?.url}
                  processing={preparing}
                  disabled={isSubmitting || completed}
                  onSelect={(files) => void selectPhoto(files)}
                  onRemove={() => {
                    setPhoto(undefined)
                    setPhotoError(null)
                  }}
                />
                {photoError && (
                  <p role="alert" className="mt-3 text-sm text-error-500">
                    {photoError}
                  </p>
                )}
                <p className="mt-3 text-xs leading-relaxed text-neutral-700">
                  사진 비율은 그대로 유지돼요. GIF와 Live Photo는 정지 사진으로 등록돼요.
                </p>
              </section>
              <section aria-labelledby="description-heading" className="flex min-w-0 flex-col">
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-600">
                    2
                  </span>
                  <h2 id="description-heading" className="text-base font-semibold">
                    <label htmlFor="contest-description">우리 아이 소개</label>
                  </h2>
                  <span className="text-xs text-primary-600">필수</span>
                </div>
                <TextareaField
                  id="contest-description"
                  required
                  value={text}
                  disabled={isSubmitting || completed}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="이름과 매력 포인트를 알려주세요. 예) 햇살 아래 낮잠을 좋아하는 파이리예요!"
                  maxLength={MAX_DESCRIPTION}
                  currentLength={text.length}
                  aria-describedby="description-help"
                />
                <p id="description-help" className="mt-2 text-xs text-neutral-700">
                  이름, 성격, 사진 속 이야기를 자유롭게 들려주세요.
                </p>
                <aside className="mt-6 rounded-xl bg-neutral-50 p-5">
                  <h3 className="mb-3 text-sm font-semibold">참여 전 확인해 주세요</h3>
                  <ul className="space-y-2.5 text-sm leading-relaxed text-neutral-700">
                    <li className="flex gap-2">
                      <CheckIcon className="mt-1 size-4 shrink-0 text-primary-500" />
                      직접 촬영했거나 사용 권한이 있는 사진을 올려주세요.
                    </li>
                    <li className="flex gap-2">
                      <CheckIcon className="mt-1 size-4 shrink-0 text-primary-500" />
                      사진과 소개는 콘테스트에 공개돼요.
                    </li>
                  </ul>
                </aside>
                <div className="mt-6 border-t border-neutral-150 pt-5 tab:mt-auto tab:pt-6">
                  <p role="status" className="mb-3 text-sm text-neutral-700">
                    {isSubmitting
                      ? '사진을 업로드하고 참여를 등록하고 있어요…'
                      : preparing
                        ? '사진을 준비하고 있어요…'
                        : photo && text.trim()
                          ? '준비됐어요! 우리 아이의 순간을 공유해 보세요.'
                          : '사진 1장과 소개를 작성하면 참여할 수 있어요.'}
                  </p>
                  {error && (
                    <p role="alert" className="mb-3 text-sm text-error-500">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!isValid}
                    className="w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                  >
                    {isSubmitting ? '참여 등록 중…' : '콘테스트 참여하기'}
                  </Button>
                </div>
              </section>
            </div>
          </form>
        </div>
      </Container>
      <CtaModal
        open={showGuard}
        onOpenChange={(open) => {
          if (!open) cancelExit()
        }}
        title="작성을 그만둘까요?"
        description="선택한 사진과 소개는 저장되지 않아요."
        actions={[
          { label: '계속 작성하기', onClick: cancelExit, variant: 'fill' },
          {
            label: '나가기',
            onClick: () => confirmExit(() => router.push('/hall-of-fame')),
            variant: 'outline',
          },
        ]}
      />
    </div>
  )
}
export { ContestEntryContent }
