'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { RadioCardGroup } from '@/shared/ui/RadioCardGroup'
import { TASTE_QUESTIONS } from '../constants/discovery'
import { tasteResult } from '../model/discovery'
import { useToolOwner } from '../model/useToolOwner'
import { DiscoveryScene } from './DiscoveryScene'
import { PlayResultActions } from './PlayResultActions'
import { PlayResultCard } from './PlayResultCard'
import { ToolPage } from './ToolPage'
import styles from './Discovery.module.css'

const LAST = TASTE_QUESTIONS.length - 1

function TasteGame({ owner }: { owner: string }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [finished, setFinished] = useState(false)
  const title = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)
  useEffect(() => {
    // 첫 진입에서는 포커스를 옮기지 않고, 질문이나 결과가 바뀔 때만 제목으로 옮긴다.
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    title.current?.focus({ preventScroll: true })
    title.current?.scrollIntoView({ block: 'nearest' })
  }, [step, finished])
  const question = TASTE_QUESTIONS[step]
  const result = finished ? tasteResult(answers) : null

  return (
    <div className="grid items-start gap-6 lap:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lap:gap-8">
      <aside className="space-y-4">
        <DiscoveryScene variant="taste" />
        <div>
          <h2 className="font-cafe24 text-xl text-neutral-850">가장 가까운 모습을 골라보세요</h2>
          <p className="mt-2 text-sm leading-6 break-keep text-neutral-700">
            네 가지 질문, 정답은 없어요. 지금 떠오르는 모습을 고르면 충분해요.
          </p>
          <p className="mt-2 text-xs leading-5 break-keep text-neutral-700">
            고른 답을 정해진 규칙으로 묶어 만드는 재미용 카드예요. AI 분석이나 성격·건강 진단이
            아니며, 답변은 서버에 보내지 않아요.
          </p>
        </div>
      </aside>

      <section
        aria-labelledby="taste-question"
        className="min-w-0 rounded-2xl border border-secondary-200 bg-base-white p-5 tab:p-6"
      >
        {result ? (
          <>
            <h2
              id="taste-question"
              ref={title}
              tabIndex={-1}
              className="scroll-mt-24 font-cafe24 text-xl text-neutral-850 outline-none"
            >
              오늘 완성한 우리 아이 취향 카드
            </h2>
            <div className={`mt-4 ${styles.reveal}`}>
              <PlayResultCard card={result} />
              <PlayResultActions card={result} owner={owner} from="taste" />
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5">
              <button
                type="button"
                className="min-h-11 text-sm text-primary-600 underline underline-offset-4 focus-ring"
                onClick={() => {
                  setStep(LAST)
                  setFinished(false)
                }}
              >
                고른 답 다시 보기
              </button>
              <button
                type="button"
                className="min-h-11 text-sm text-primary-600 underline underline-offset-4 focus-ring"
                onClick={() => {
                  setAnswers([])
                  setStep(0)
                  setFinished(false)
                }}
              >
                처음부터 다시 하기
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs font-semibold text-primary-600">
              <span>
                질문 {step + 1} / {TASTE_QUESTIONS.length}
              </span>
              <span>나만의 취향 카드 만들기</span>
            </div>
            <progress
              value={step + 1}
              max={TASTE_QUESTIONS.length}
              aria-label="취향 질문 진행률"
              className="mt-2 h-2 w-full accent-primary-500"
            />
            <h2
              id="taste-question"
              ref={title}
              tabIndex={-1}
              className="mt-5 scroll-mt-24 font-cafe24 text-xl leading-snug break-keep text-neutral-850 outline-none"
            >
              {question.title}
            </h2>
            <div className="mt-4">
              <RadioCardGroup
                key={step}
                name={`taste-${step}`}
                label="가장 가까운 모습"
                required={false}
                value={answers[step] === undefined ? '' : String(answers[step])}
                options={question.options.map((option, index) => ({
                  value: String(index),
                  label: option,
                }))}
                onChange={(value) =>
                  setAnswers((previous) => {
                    const next = [...previous]
                    next[step] = Number(value)
                    return next
                  })
                }
              />
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                intent="secondary"
                width="fill"
                disabled={step === 0}
                onClick={() => setStep((previous) => previous - 1)}
              >
                이전 질문
              </Button>
              <Button
                width="fill"
                disabled={answers[step] === undefined}
                onClick={() => {
                  if (step === LAST) setFinished(true)
                  else setStep((previous) => previous + 1)
                }}
              >
                {step === LAST ? '취향 카드 펼치기' : '다음 질문'}
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export function PetTasteDiscovery() {
  const owner = useToolOwner()
  return (
    <ToolPage
      title="우리 아이 취향 찾기"
      description="잘 아는 것 같다가도 새롭게 보이는 우리 아이. 오늘은 어떤 모습이 떠오르나요?"
    >
      {owner === null ? (
        <p role="status" className="text-sm text-neutral-700">
          취향 놀이를 준비하고 있어요.
        </p>
      ) : (
        <TasteGame key={owner} owner={owner} />
      )}
    </ToolPage>
  )
}
