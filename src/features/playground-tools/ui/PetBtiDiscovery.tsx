'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { PixelProgressBar } from '@/shared/ui/PixelProgressBar'
import { RadioCardGroup } from '@/shared/ui/RadioCardGroup'
import { BTI_NAME, BTI_QUESTIONS } from '../constants/discovery'
import { btiResult } from '../model/discovery'
import { useToolOwner } from '../model/useToolOwner'
import { DiscoveryScene } from './DiscoveryScene'
import { PlayResultActions } from './PlayResultActions'
import { PlayResultCard } from './PlayResultCard'
import { ToolPage } from './ToolPage'
import styles from './Discovery.module.css'

const LAST = BTI_QUESTIONS.length - 1

// 취향 찾기와 같은 진행(한 문항씩 고르고 다음으로)과 결과 카드를 쓴다. 문항만 둘 중 하나다.
function BtiGame({ owner }: { owner: string }) {
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
  const question = BTI_QUESTIONS[step]
  const result = finished ? btiResult(answers) : null
  const percent = Math.round(((step + 1) / BTI_QUESTIONS.length) * 100)

  return (
    <div className="grid items-start gap-6 lap:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lap:gap-8">
      <aside className="space-y-4">
        <DiscoveryScene variant="taste" />
        <div>
          <h2 className="font-cafe24 text-xl text-neutral-850">
            평소 모습에 더 가까운 쪽을 골라요
          </h2>
          <p className="mt-2 text-sm leading-6 break-keep text-neutral-700">
            열두 가지 질문, 정답은 없어요. 둘 중 더 가까운 쪽이면 충분해요.
          </p>
          <p className="mt-2 text-xs leading-5 break-keep text-neutral-700">
            고른 답을 정해진 규칙으로 묶어 만드는 재미용 카드예요. AI 분석이나 성격·건강 진단이
            아니며, 답변은 서버에 보내지 않아요.
          </p>
        </div>
      </aside>

      <section
        aria-labelledby="bti-question"
        className="min-w-0 rounded-2xl border border-secondary-200 bg-base-white p-5 tab:p-6"
      >
        {result ? (
          <>
            <h2
              id="bti-question"
              ref={title}
              tabIndex={-1}
              className="scroll-mt-24 font-cafe24 text-xl text-neutral-850 outline-none"
            >
              우리 아이의 {BTI_NAME}
            </h2>
            <div className={`mt-4 ${styles.reveal}`}>
              <PlayResultCard card={result} />
              <PlayResultActions card={result} owner={owner} from="bti" />
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
                질문 {step + 1} / {BTI_QUESTIONS.length}
              </span>
              <span>우리 아이 성향 카드 만들기</span>
            </div>
            <div className="mt-2 h-4 w-full">
              <PixelProgressBar percent={percent} label={`${BTI_NAME} 질문 진행률 ${percent}%`} />
            </div>
            <h2
              id="bti-question"
              ref={title}
              tabIndex={-1}
              className="mt-5 scroll-mt-24 font-cafe24 text-xl leading-snug break-keep text-neutral-850 outline-none"
            >
              {question.title}
            </h2>
            <div className="mt-4">
              <RadioCardGroup
                key={step}
                name={`bti-${step}`}
                label="더 가까운 모습"
                required={false}
                value={answers[step] === undefined ? '' : String(answers[step])}
                options={question.options.map((option, index) => ({
                  value: String(index),
                  label: option.label,
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
                {step === LAST ? '성향 카드 펼치기' : '다음 질문'}
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export function PetBtiDiscovery() {
  const owner = useToolOwner()
  return (
    <ToolPage
      title={`우리 아이 ${BTI_NAME}`}
      description="열두 가지 질문으로 알아보는 우리 아이의 16가지 성향. 평소 모습을 떠올려 보세요."
    >
      {owner === null ? (
        <p role="status" className="text-sm text-neutral-700">
          성향 놀이를 준비하고 있어요.
        </p>
      ) : (
        <BtiGame key={owner} owner={owner} />
      )}
    </ToolPage>
  )
}
