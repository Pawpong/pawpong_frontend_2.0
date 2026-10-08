'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/shared/ui/Button'
import { RadioCardGroup } from '@/shared/ui/RadioCardGroup'
import { OUTING_PACES, OUTING_SETTINGS } from '../constants/discovery'
import { outingCard, outingDeckSize } from '../model/discovery'
import type { OutingPace, OutingSetting } from '../model/discovery.types'
import { useToolOwner } from '../model/useToolOwner'
import { DiscoveryScene } from './DiscoveryScene'
import { PlayResultActions } from './PlayResultActions'
import { PlayResultCard } from './PlayResultCard'
import { ToolPage } from './ToolPage'
import styles from './Discovery.module.css'

const toOptions = (items: { id: string; label: string; detail: string }[]) =>
  items.map((item) => ({ value: item.id, label: item.label, description: item.detail }))

function Discovery({ owner }: { owner: string }) {
  const [setting, setSetting] = useState<OutingSetting>('outside')
  const [pace, setPace] = useState<OutingPace>('slow')
  // null이면 아직 카드를 열지 않은 상태다.
  const [turn, setTurn] = useState<number | null>(null)
  const resultHeading = useRef<HTMLHeadingElement>(null)
  const choices = useRef<HTMLDivElement>(null)
  const size = outingDeckSize(setting, pace)
  const card = turn === null ? null : outingCard(setting, pace, turn)

  useEffect(() => {
    if (turn === null) return
    resultHeading.current?.focus({ preventScroll: true })
    resultHeading.current?.scrollIntoView({ block: 'nearest' })
  }, [turn])

  function choose(next: () => void) {
    next()
    setTurn(null)
  }
  function draw() {
    // 첫 장은 묶음 안에서 무작위로, 다음 장부터는 차례로 넘겨 같은 카드가 연달아 나오지 않게 한다.
    setTurn((previous) => (previous === null ? Math.floor(Math.random() * size) : previous + 1))
  }
  function chooseAgain() {
    setTurn(null)
    choices.current?.querySelector<HTMLInputElement>('input:checked')?.focus()
  }

  return (
    <div className="grid items-start gap-6 lap:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lap:gap-8">
      <section
        aria-labelledby="outing-choose"
        className="rounded-2xl border border-secondary-200 bg-base-white p-5 tab:p-6"
      >
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
          <Button width="full" onClick={draw}>
            {card ? '다른 카드 뽑기' : '오늘의 카드 뽑기'}
          </Button>
        </div>
        <p className="mt-3 text-xs leading-5 break-keep text-neutral-700">
          위치 정보나 사진 없이 즐길 수 있어요. 선택은 서버에 보내지 않고 이 화면에서만 유지돼요.
        </p>
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
          <div key={`${setting}:${pace}:${turn}`} className={`mt-4 ${styles.reveal}`}>
            <p className="mb-3 text-xs text-neutral-700">
              이 묶음의 카드 {size}장 중 {(turn % size) + 1}번째 카드예요.
            </p>
            <PlayResultCard card={card} />
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
            <DiscoveryScene variant="outing" />
            <p className="text-sm leading-6 break-keep text-neutral-700">
              두 가지를 고르고 카드를 뽑으면 오늘의 놀이가 펼쳐져요. 완료 체크도, 순위도 없어요.
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
