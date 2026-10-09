'use client'

import { useEffect, useReducer, useRef } from 'react'
import { ArrowBackIcon, PixelArrowRightIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { PixelProgressBar } from '@/shared/ui/PixelProgressBar'
import { TicketStrip, ticketStyles, type TicketAccent } from '@/shared/ui/Ticket'
import { prefersReducedMotion } from '../lib/motion'
import type { PlayCard } from '../model/discovery.types'
import { initialPlayQuiz, playQuizReducer } from '../model/playQuiz'
import { DiscoveryScene } from './DiscoveryScene'
import { PlayResultActions } from './PlayResultActions'
import { PlayResultCard } from './PlayResultCard'
import { PlayShuffle } from './PlayShuffle'
import styles from './Discovery.module.css'

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F']
// 고른 버튼이 통 튀는 모습을 보여 준 뒤 다음 질문으로 넘긴다.
const PICK_DELAY = 320
// 마지막 답 뒤 결과 카드를 섞는 시간
const SHUFFLE_DELAY = 1100

const pad = (value: number) => String(value).padStart(2, '0')

export interface PlayQuizQuestion {
  title: string
  options: readonly string[]
}

interface PlayQuizProps {
  owner: string
  id: 'taste' | 'bti'
  accent: TicketAccent
  questions: readonly PlayQuizQuestion[]
  getResult: (answers: readonly number[]) => PlayCard | null
  /** 왼쪽(모바일은 아래) 안내 */
  intro: { title: string; body: string }
  resultTitle: string
  shuffleText: string
  /** 결과 카드 머리 줄 도장 */
  stamp: (card: PlayCard) => string
}

/**
 * 취향 찾기·멍냥BTI 공통 진행. 답을 누르면 통 튀고 바로 다음 질문으로 넘어가며,
 * 마지막 답 뒤에는 카드를 섞어 결과 티켓을 펼친다. 답은 이 화면 상태에만 둔다.
 */
export function PlayQuiz({
  owner,
  id,
  accent,
  questions,
  getResult,
  intro,
  resultTitle,
  shuffleText,
  stamp,
}: PlayQuizProps) {
  const [{ step, answers, phase, picked, beat }, dispatch] = useReducer(
    playQuizReducer,
    initialPlayQuiz,
  )
  const total = questions.length
  // 고른 버튼이 튀는 동안 기다리는 타이머. 다른 질문으로 옮기거나 화면을 떠나면 지운다.
  const timer = useRef<number | undefined>(undefined)
  const title = useRef<HTMLHeadingElement>(null)
  // 첫 진입(개발 모드의 이중 실행 포함)에서는 포커스를 옮기지 않고, 질문이나 단계가 바뀔 때만 옮긴다.
  const shown = useRef({ step, phase })

  useEffect(() => () => window.clearTimeout(timer.current), [])
  useEffect(() => {
    if (shown.current.step === step && shown.current.phase === phase) return
    shown.current = { step, phase }
    // 섞는 동안은 상태 문구가 알리고, 결과가 나오면 제목으로 옮긴다.
    if (phase === 'shuffling') return
    title.current?.focus({ preventScroll: true })
    title.current?.scrollIntoView({ block: 'nearest' })
  }, [step, phase])
  // 마지막 답 뒤에는 카드를 잠깐 섞은 뒤 결과를 펼친다.
  useEffect(() => {
    if (phase !== 'shuffling') return
    if (prefersReducedMotion()) {
      dispatch({ type: 'done' })
      return
    }
    const id = window.setTimeout(() => dispatch({ type: 'done' }), SHUFFLE_DELAY)
    return () => window.clearTimeout(id)
  }, [phase])

  const last = total - 1
  const question = questions[step]
  const answered = answers[step] !== undefined
  const result = phase === 'done' ? getResult(answers) : null
  const percent = phase === 'asking' ? Math.round((step / total) * 100) : 100
  const headingId = `${id}-question`

  function pick(index: number) {
    // 넘어가는 중에 한 번 더 눌러도 두 질문을 건너뛰지 않는다(리듀서도 한 번 더 막는다).
    if (picked !== null) return
    dispatch({ type: 'pick', index })
    window.clearTimeout(timer.current)
    if (prefersReducedMotion()) dispatch({ type: 'advance', total })
    else timer.current = window.setTimeout(() => dispatch({ type: 'advance', total }), PICK_DELAY)
  }

  function goTo(target: number) {
    window.clearTimeout(timer.current)
    dispatch({ type: 'go', step: target, total })
  }

  function restart() {
    window.clearTimeout(timer.current)
    dispatch({ type: 'restart' })
  }

  return (
    <div className="grid items-start gap-6 lap:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lap:gap-8">
      {/* 모바일은 질문부터, 노트북부터는 왼쪽 장면 옆에 둔다. */}
      <section aria-labelledby={headingId} className="min-w-0 lap:order-2">
        {phase === 'asking' ? (
          <div data-accent={accent} className={ticketStyles.ticket}>
            <TicketStrip
              label="QUESTION"
              icon={
                <span aria-hidden>
                  {pad(step + 1)} / {pad(total)}
                </span>
              }
            />
            <div className="p-5 tab:p-6">
              <div className="h-4">
                <PixelProgressBar percent={percent} label={`질문 진행률 ${percent}%`} />
              </div>
              <div key={step} className={styles.question}>
                <h2
                  id={headingId}
                  ref={title}
                  tabIndex={-1}
                  className="mt-5 scroll-mt-24 font-cafe24 text-xl leading-snug break-keep text-neutral-850 outline-none tab:text-2xl"
                >
                  <span className="sr-only">
                    질문 {step + 1} / {total}.{' '}
                  </span>
                  {question.title}
                </h2>
                <ul className="mt-5 grid gap-3" aria-labelledby={headingId}>
                  {question.options.map((option, index) => (
                    <li key={option}>
                      <button
                        type="button"
                        aria-pressed={answers[step] === index}
                        data-picked={picked === index ? '' : undefined}
                        className={cn(styles.choice, 'focus-ring')}
                        onClick={() => pick(index)}
                      >
                        <span aria-hidden className={styles.choiceKey}>
                          {KEYS[index]}
                        </span>
                        <span className="min-w-0">{option}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 flex min-h-11 items-center justify-between gap-3">
                {step > 0 ? (
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-neutral-700 focus-ring hover:text-neutral-850"
                    onClick={() => goTo(step - 1)}
                  >
                    <ArrowBackIcon aria-hidden className="size-4" />
                    이전 질문
                  </button>
                ) : (
                  <span className="text-xs text-neutral-700">
                    고르면 바로 다음 질문으로 넘어가요
                  </span>
                )}
                {/* 앞 질문으로 돌아왔을 때만: 고른 답 그대로 다음으로 가거나 결과를 다시 펼친다. */}
                {answered && picked === null && (
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary-600 focus-ring"
                    onClick={() =>
                      step === last ? dispatch({ type: 'reveal', total }) : goTo(step + 1)
                    }
                  >
                    {step === last ? '결과 보기' : '다음 질문'}
                    <PixelArrowRightIcon aria-hidden className="size-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2
              id={headingId}
              ref={title}
              tabIndex={-1}
              className="scroll-mt-24 font-cafe24 text-xl break-keep text-neutral-850 outline-none"
            >
              {resultTitle}
            </h2>
            <div className="mt-4">
              {result ? (
                <>
                  <PlayResultCard card={result} stamp={stamp(result)} />
                  <PlayResultActions card={result} owner={owner} from={id} />
                  <div className="mt-4 flex flex-wrap gap-x-5">
                    <button
                      type="button"
                      className="min-h-11 text-sm text-primary-600 underline underline-offset-4 focus-ring"
                      onClick={() => goTo(last)}
                    >
                      고른 답 다시 보기
                    </button>
                    <button
                      type="button"
                      className="min-h-11 text-sm text-primary-600 underline underline-offset-4 focus-ring"
                      onClick={restart}
                    >
                      처음부터 다시 하기
                    </button>
                  </div>
                </>
              ) : phase === 'shuffling' ? (
                <PlayShuffle accent={accent} label={shuffleText} />
              ) : (
                <div role="alert" className="space-y-3 text-sm text-neutral-700">
                  <p>결과 카드를 만들지 못했어요. 처음부터 다시 골라 주세요.</p>
                  <button
                    type="button"
                    className="min-h-11 text-sm font-semibold text-primary-600 underline underline-offset-4 focus-ring"
                    onClick={restart}
                  >
                    처음부터 다시 하기
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <aside className="space-y-4 lap:order-1">
        <DiscoveryScene variant="taste" beat={beat} busy={phase === 'shuffling'} />
        <div>
          <h2 className="font-cafe24 text-xl text-neutral-850">{intro.title}</h2>
          <p className="mt-2 text-sm leading-6 break-keep text-neutral-700">{intro.body}</p>
          <p className="mt-2 text-xs leading-5 break-keep text-neutral-700">
            고른 답을 정해진 규칙으로 묶어 만드는 재미용 카드예요. AI 분석이나 성격·건강 진단이
            아니며, 답변은 서버에 보내지 않아요.
          </p>
        </div>
      </aside>
    </div>
  )
}
