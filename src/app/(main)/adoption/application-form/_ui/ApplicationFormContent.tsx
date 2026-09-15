'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { applicationQueries } from '@/entities/application'
import { useUpdateSimpleApplicationForm } from '@/features/breeder'
import { normalizeApiError } from '@/shared/api'
import { TEXT } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { useToast } from '@/shared/lib/useToast'
import { AlertCircleIcon, CheckIcon, CloseIcon, PlusIcon } from '@/shared/assets'
import { AlertMessage, AsyncState, Button, Container, Textarea, NavigationBar } from '@/shared/ui'

const MAX_QUESTIONS = 5
const MIN_LENGTH = 2
const MAX_LENGTH = 200

interface QuestionRow {
  /** 로드된 질문은 서버 id, 새로 추가한 행은 temp- 접두 로컬 id (저장 전까지만 키로 쓴다) */
  key: string
  question: string
}

const toRows = (questions: { id: string; label: string }[]): QuestionRow[] =>
  questions.map((q) => ({ key: q.id, question: q.label }))

const ApplicationFormContent = () => {
  const toast = useToast()
  const formQuery = useQuery({ ...applicationQueries.form(), refetchOnMount: 'always' })
  const updateForm = useUpdateSimpleApplicationForm()

  const [rows, setRows] = useState<QuestionRow[]>([])
  const [savedRows, setSavedRows] = useState<QuestionRow[]>([])
  const [seeded, setSeeded] = useState(false)

  const data = formQuery.data
  if (!seeded && data) {
    const loaded = toRows(data.customQuestions)
    setRows(loaded)
    setSavedRows(loaded)
    setSeeded(true)
  }

  const isMaxReached = rows.length >= MAX_QUESTIONS
  const isDirty =
    JSON.stringify(rows.map((r) => r.question.trim())) !==
    JSON.stringify(savedRows.map((r) => r.question.trim()))

  const handleAdd = () => {
    if (isMaxReached || updateForm.isPending) return
    setRows((prev) => [...prev, { key: `temp-${Date.now()}-${prev.length}`, question: '' }])
  }

  const handleRemove = (key: string) => {
    setRows((prev) => prev.filter((r) => r.key !== key))
  }

  const handleChange = (key: string, value: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, question: value } : r)))
  }

  const handleSave = async () => {
    if (updateForm.isPending) return
    const valid = rows.map((r) => r.question.trim()).filter((q) => q.length > 0)

    const tooShort = valid.some((q) => q.length < MIN_LENGTH)
    if (tooShort) {
      toast.error(`질문은 최소 ${MIN_LENGTH}자 이상이어야 합니다.`)
      return
    }
    if (new Set(valid).size !== valid.length) {
      toast.error('중복된 질문이 있습니다. 각 질문은 고유해야 합니다.')
      return
    }

    try {
      const result = await updateForm.mutateAsync({
        questions: valid.map((question) => ({ question })),
      })
      const saved = toRows(result.customQuestions)
      setRows(saved)
      setSavedRows(saved)
      toast.success(`커스텀 질문 ${saved.length}개가 저장되었습니다.`)
    } catch (error) {
      toast.error(normalizeApiError(error, '저장에 실패했습니다.').message)
    }
  }

  if (!seeded) {
    return (
      <div className="flex w-full flex-col">
        <NavigationBar title="신청서 질문 관리" backHref="/home" />
        <AsyncState
          status={formQuery.isError ? 'error' : 'loading'}
          message={
            formQuery.isError ? '신청서를 불러오지 못했습니다.' : '신청서를 불러오는 중입니다.'
          }
          action={
            formQuery.isError ? (
              <Button variant="fill" size="sm" onClick={() => void formQuery.refetch()}>
                다시 시도
              </Button>
            ) : undefined
          }
          className="min-h-[calc(100dvh-3.5rem)]"
        />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col">
      <NavigationBar title="신청서 질문 관리" backHref="/home" />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 pt-8 pb-36 tab:gap-10 tab:px-8 tab:pt-12">
        <header>
          <p className={cn(TEXT.meta, 'mb-2')}>입양 신청서 설정</p>
          <h1 className={TEXT.display}>입양자에게 궁금한 점을 물어보세요</h1>
          <p className={cn(TEXT.prose, 'mt-4')}>
            기본 질문에 더해, 브리더님이 꼭 확인하고 싶은 내용을 추가할 수 있어요.
          </p>
        </header>

        <section aria-labelledby="custom-questions-title">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 id="custom-questions-title" className={TEXT.section}>
              추가 질문
            </h2>
            <span
              className="rounded-full bg-primary-50 px-3 py-1 text-body-md font-medium text-primary-700"
              aria-label={`최대 ${MAX_QUESTIONS}개 중 ${rows.length}개`}
            >
              {rows.length} / {MAX_QUESTIONS}
            </span>
          </div>
          {rows.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-300 px-5 py-8 text-center tab:py-10">
              <p className={TEXT.body}>어떤 질문을 추가할까요?</p>
              <p className={cn(TEXT.meta, 'mt-2')}>
                생활 환경이나 반려동물 돌봄 계획을 물어보세요.
              </p>
              <p className="mt-4 text-body-md font-medium text-primary-500">
                예: 집을 비울 때 반려동물은 누가 돌보나요?
              </p>
            </div>
          )}
          <div className="flex flex-col gap-4">
            {rows.map((row, index) => (
              <div
                key={row.key}
                className="rounded-2xl border border-neutral-150 bg-white p-5 tab:p-6"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label
                    htmlFor={`question-${row.key}`}
                    className="flex items-center gap-2 text-body-md font-semibold text-neutral-850"
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary-50 text-body-sm text-primary-700">
                      {index + 1}
                    </span>
                    질문 내용
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemove(row.key)}
                    aria-label={`추가 질문 ${index + 1} 삭제`}
                    disabled={updateForm.isPending}
                    className="-mr-2 flex size-10 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-50 hover:text-error-500 focus-visible:outline-2 focus-visible:outline-primary-500 disabled:opacity-50"
                  >
                    <CloseIcon className="size-4" />
                  </button>
                </div>
                <Textarea
                  id={`question-${row.key}`}
                  aria-describedby={`question-count-${row.key}`}
                  disabled={updateForm.isPending}
                  value={row.question}
                  onChange={(e) => handleChange(row.key, e.target.value)}
                  placeholder="입양자에게 확인하고 싶은 내용을 적어주세요"
                  maxLength={MAX_LENGTH}
                  className="h-28 text-body-md"
                />
                <p
                  id={`question-count-${row.key}`}
                  className="mt-2 text-right text-body-sm font-medium text-neutral-500"
                >
                  {row.question.length}/{MAX_LENGTH}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleAdd}
              disabled={isMaxReached || updateForm.isPending}
              className="w-full gap-2 rounded-xl border-dashed text-body-md"
            >
              <PlusIcon className="size-5" />
              질문 추가하기
            </Button>
            <p className="text-center text-body-sm font-medium text-neutral-500">
              {isMaxReached
                ? '질문 5개를 모두 추가했어요.'
                : `최대 ${MAX_QUESTIONS}개 · 질문당 ${MIN_LENGTH}~${MAX_LENGTH}자`}
            </p>
          </div>
        </section>
        <p className={cn(TEXT.meta, 'border-t border-neutral-100 pt-5')}>
          저장한 질문은 기본 질문과 함께 입양 신청서에 표시돼요. 비워 둔 질문은 저장되지 않아요.
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-sticky border-t border-neutral-100 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-4 tab:px-8">
          <p role="status" className="hidden text-body-md text-neutral-500 tab:block">
            {updateForm.isPending
              ? '질문을 저장하고 있어요.'
              : isDirty
                ? '변경한 내용을 저장해주세요.'
                : '저장된 내용과 같아요.'}
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => void handleSave()}
            disabled={!isDirty || updateForm.isPending}
            className="w-full tab:w-48"
          >
            {updateForm.isPending ? '저장 중…' : '질문 저장하기'}
          </Button>
        </div>
        {toast.current && (
          <Container className="absolute inset-x-0 bottom-[5rem]">
            <AlertMessage
              status={toast.current.status}
              size="responsive"
              icon={toast.current.status === 'error' ? AlertCircleIcon : CheckIcon}
              message={toast.current.message}
              onClose={toast.hide}
            />
          </Container>
        )}
      </div>
    </div>
  )
}

export { ApplicationFormContent }
