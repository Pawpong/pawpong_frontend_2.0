'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { applicationQueries } from '@/entities/application'
import { useUpdateSimpleApplicationForm } from '@/features/breeder'
import { normalizeApiError } from '@/shared/api'
import { useToast } from '@/shared/lib/useToast'
import { AlertCircleIcon, CheckIcon, CloseIcon, PlusIcon } from '@/shared/assets'
import {
  AlertMessage,
  AsyncState,
  Button,
  Container,
  FooterCtaBar,
  Input,
  NavigationBar,
} from '@/shared/ui'

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
    if (isMaxReached) return
    setRows((prev) => [...prev, { key: `temp-${Date.now()}-${prev.length}`, question: '' }])
  }

  const handleRemove = (key: string) => {
    setRows((prev) => prev.filter((r) => r.key !== key))
  }

  const handleChange = (key: string, value: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, question: value } : r)))
  }

  const handleSave = async () => {
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
        <NavigationBar title="신청서 질문 관리" backHref="/settings" />
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
      <NavigationBar title="신청서 질문 관리" backHref="/settings" />

      <Container className="flex flex-col gap-8 px-4 pt-8 pb-[7.5rem] tab:px-20">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-neutral-850 tab:text-base">브리더 추가 질문</p>
          <p className="text-xs leading-[1.5] font-medium text-neutral-500 tab:text-sm">
            입양 신청서에 표준 질문과 함께 노출돼요. 최대 {MAX_QUESTIONS}개까지 추가할 수 있어요.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {rows.map((row, index) => (
            <div key={row.key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs leading-[1.5] font-semibold text-neutral-700">
                  추가 질문 {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => handleRemove(row.key)}
                  aria-label="질문 삭제"
                  className="flex items-center gap-0.5 text-neutral-500 hover:text-neutral-700"
                >
                  <CloseIcon className="size-4" />
                  <span className="text-xs leading-[1.5] font-medium">삭제</span>
                </button>
              </div>
              <Input
                value={row.question}
                onChange={(e) => handleChange(row.key, e.target.value)}
                placeholder={`질문을 입력해주세요 (${MIN_LENGTH}~${MAX_LENGTH}자)`}
                maxLength={MAX_LENGTH}
              />
              <p className="self-end text-[0.625rem] leading-[1.5] font-medium text-neutral-500">
                {row.question.length}/{MAX_LENGTH}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={handleAdd}
            disabled={isMaxReached}
            className="w-full max-w-64 gap-1.5"
          >
            <PlusIcon className="size-5" />
            추가하기
          </Button>
          {isMaxReached && (
            <p className="text-xs leading-[1.5] font-medium text-neutral-500">
              커스텀 질문은 최대 {MAX_QUESTIONS}개까지만 추가할 수 있습니다.
            </p>
          )}
        </div>
      </Container>

      <FooterCtaBar
        primary={{
          label: '저장하기',
          onClick: () => void handleSave(),
          disabled: !isDirty || updateForm.isPending,
        }}
      >
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
      </FooterCtaBar>
    </div>
  )
}

export { ApplicationFormContent }
