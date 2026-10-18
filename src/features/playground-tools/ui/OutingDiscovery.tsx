'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { PawPrintIcon } from '@/shared/assets'
import { Button } from '@/shared/ui/Button'
import { RadioCardGroup } from '@/shared/ui/RadioCardGroup'
import { TicketStrip, ticketStyles } from '@/shared/ui/Ticket'
import { OUTING_PACES, OUTING_SETTINGS } from '../constants/discovery'
import { prefersReducedMotion } from '../lib/motion'
import { outingCard, outingDeckSize } from '../model/discovery'
import type { OutingPace, OutingSetting } from '../model/discovery.types'
import { useToolOwner } from '../model/useToolOwner'
import { DiscoveryScene } from './DiscoveryScene'
import { PlayResultActions } from './PlayResultActions'
import { PlayResultCard } from './PlayResultCard'
import { ToolPage } from './ToolPage'

const toOptions = (items: { id: string; label: string; detail: string }[]) =>
  items.map((item) => ({ value: item.id, label: item.label, description: item.detail }))
// 덱을 섞는 모습을 보여 준 뒤 카드를 펼친다.
const SHUFFLE_DELAY = 900

function Discovery({ owner }: { owner: string }) {
  const [setting, setSetting] = useState<OutingSetting>('outside')
  const [pace, setPace] = useState<OutingPace>('slow')
  // null이면 아직 카드를 열지 않은 상태다.
  const [turn, setTurn] = useState<number | null>(null)
  // 덱을 섞는 동안에는 장면이 움직이고, 버튼을 다시 눌러도 카드를 두 장 넘기지 않는다.
  const [drawing, setDrawing] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const resultHeading = useRef<HTMLHeadingElement>(null)
  const choices = useRef<HTMLDivElement>(null)
  const size = outingDeckSize(setting, pace)
  const card = turn === null || drawing ? null : outingCard(setting, pace, turn)

  useEffect(() => () => window.clearTimeout(timer.current), [])
  useEffect(() => {
    if (turn === null) return
    resultHeading.current?.focus({ preventScroll: true })
    resultHeading.current?.scrollIntoView({ block: 'nearest' })
  }, [turn])

  function stopDrawing() {
    window.clearTimeout(timer.current)
    setDrawing(false)
  }
  function choose(next: () => void) {
    next()
    stopDrawing()
    setTurn(null)
  }
  function draw() {
    if (drawing) return
    // 첫 장은 묶음 안에서 무작위로, 다음 장부터는 차례로 넘겨 같은 카드가 연달아 나오지 않게 한다.
    const next = turn === null ? Math.floor(Math.random() * size) : turn + 1
    if (prefersReducedMotion()) {
      setTurn(next)
      return
    }
    setDrawing(true)
    // 모바일에서는 결과 자리가 버튼 아래에 있으니, 섞는 모습이 보이게 먼저 내려 준다.
    resultHeading.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    timer.current = window.setTimeout(() => {
      setDrawing(false)
      setTurn(next)
    }, SHUFFLE_DELAY)
  }
  function chooseAgain() {
    setTurn(null)
    choices.current?.querySelector<HTMLInputElement>('input:checked')?.focus()
  }

  return (
    <div className="grid items-start gap-6 lap:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lap:gap-8">
      <section aria-labelledby="outing-choose" data-accent="butter" className={ticketStyles.ticket}>
        <TicketStrip label="MOOD PICK" icon={<PawPrintIcon aria-hidden className="size-5" />} />
        <div className="p-5 tab:p-6">
          <h2 id="outing-choose" className="font-cafe24 text-xl text-neutral-850">
            오늘의 기분을 골라주세요
          </h2>
          <p className="mt-2 text-sm leading-6 break-keep text-neutral-700">
            밖에 나가도, 집에 있어도 좋아요. 고른 분위기의 카드 묶음에서 한 장을 뽑아드려요.
          </p>
          <div ref={choices} className="mt-5 space-y-5">
            <RadioCardGroup
              name="outing-setting"
              label="어디에서 함께할까요?"
              required={false}
              value={setting}
              options={toOptions(OUTING_SETTINGS)}
              onChange={(value) => choose(() => setSetting(value as OutingSetting))}
            />
            <RadioCardGroup
              name="outing-pace"
              label="오늘은 어떤 분위기인가요?"
              required={false}
              value={pace}
              options={toOptions(OUTING_PACES)}
              onChange={(value) => choose(() => setPace(value as OutingPace))}
            />
          </div>
          <div className="mt-6">
            <Button width="full" onClick={draw} aria-busy={drawing || undefined}>
              {drawing ? '카드를 섞는 중…' : turn === null ? '오늘의 카드 뽑기' : '다른 카드 뽑기'}
            </Button>
          </div>
          <p className="mt-3 text-xs leading-5 break-keep text-neutral-700">
            위치 정보나 사진 없이 즐길 수 있어요. 선택은 서버에 보내지 않고 이 화면에서만 유지돼요.
          </p>
        </div>
      </section>

      <section aria-labelledby="outing-result" className="min-w-0">
        <h2
          id="outing-result"
          ref={resultHeading}
          tabIndex={-1}
          className="scroll-mt-24 font-cafe24 text-xl text-neutral-850 outline-none"
        >
          {card ? '오늘 우리에게 온 카드' : '어떤 하루가 기다릴까요?'}
        </h2>
        {card && turn !== null ? (
          <div key={`${setting}:${pace}:${turn}`} className="mt-4">
            <p className="mb-3 text-xs text-neutral-700">
              이 묶음의 카드 {size}장 중 {(turn % size) + 1}번째 카드예요.
            </p>
            <PlayResultCard card={card} stamp="TODAY" />
            <PlayResultActions card={card} owner={owner} from="outing" />
            <button
              type="button"
              onClick={chooseAgain}
              className="mt-4 min-h-11 text-sm text-primary-600 underline underline-offset-4 focus-ring"
            >
              분위기 다시 고르기
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <DiscoveryScene variant="outing" busy={drawing} />
            <p role="status" className="text-sm leading-6 break-keep text-neutral-700">
              {drawing
                ? '카드를 섞고 있어요. 어떤 하루가 나올까요?'
                : '두 가지를 고르고 카드를 뽑으면 오늘의 놀이가 펼쳐져요. 완료 체크도, 순위도 없어요.'}
            </p>
          </div>
        )}
        <p className="mt-5 text-xs leading-5 break-keep text-neutral-700">
          실제 산책 경로나 날씨·건강에 대한 추천이 아니에요. 아이에게 익숙하고 편안한 범위에서만
          즐겨주세요. 준비물이 필요하면{' '}
          <Link
            href="/playground/outing"
            className="text-primary-600 underline underline-offset-4 focus-ring"
          >
            외출 준비함
          </Link>
          을 열어보세요.
        </p>
      </section>
    </div>
  )
}

export function OutingDiscovery() {
  const owner = useToolOwner()
  return (
    <ToolPage
      title="오늘의 산책 뽑기"
      description="어디로 갈지보다, 어떤 하루를 보낼지. 우리만의 작은 모험을 골라요."
    >
      {owner === null ? (
        <p role="status" className="text-sm text-neutral-700">
          놀이 카드를 준비하고 있어요.
        </p>
      ) : (
        <Discovery key={owner} owner={owner} />
      )}
    </ToolPage>
  )
}
