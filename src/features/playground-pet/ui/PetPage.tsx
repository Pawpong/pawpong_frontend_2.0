'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/shared/api/unwrap'
import { Button, buttonVariants } from '@/shared/ui/Button'
import { FeatureIntro } from '@/shared/ui/FeatureIntro'
import { PawPrintIcon } from '@/shared/assets'
import { petConfigOptions, usePetController } from '../lib/usePetController'
import { petRequestKey } from '../lib/useServerClock'
import { usePetSession, type PetSession } from '../lib/usePetSession'
import { PetAdoption } from './PetAdoption'
import { PetRoom } from './PetRoom'

function PetSessionContent({
  session,
  initialSourceJobId,
}: {
  session: PetSession
  initialSourceJobId?: string
}) {
  const controller = usePetController(session)
  const { query, busy, uncertain, notice } = controller
  if (!query.data) {
    if (query.isPending)
      return (
        <p role="status" className="rounded-2xl bg-point-50 p-10 text-center text-neutral-700">
          친구의 방을 준비하고 있어요…
        </p>
      )
    const unavailable = query.error instanceof ApiError && query.error.status === 404
    return (
      <div role="alert" className="space-y-4 rounded-2xl border border-secondary-200 p-6">
        <p>
          {unavailable
            ? '도트 친구가 잠시 쉬고 있어요. 놀이터에서 다른 놀이를 만나 보세요.'
            : '친구의 방을 불러오지 못했어요. 저장된 친구는 그대로 있어요.'}
        </p>
        {!unavailable && (
          <Button intent="secondary" onClick={() => void query.refetch()}>
            다시 불러오기
          </Button>
        )}
        <div>
          <Link href="/playground" className={buttonVariants({ intent: 'secondary' })}>
            놀이터로 돌아가기
          </Link>
        </div>
      </div>
    )
  }
  const view = query.data
  return (
    <div className="space-y-5">
      {(notice || busy || query.isError) && (
        <div
          role={uncertain || query.isError ? 'alert' : 'status'}
          aria-live="polite"
          className="rounded-xl border border-secondary-200 bg-point-50 px-5 py-4 text-sm leading-6 text-neutral-850"
        >
          <p>
            {busy
              ? '친구에게 마음을 전하고 있어요…'
              : notice || '최신 상태를 확인하지 못했어요. 연결을 확인한 뒤 다시 불러와 주세요.'}
          </p>
          {uncertain && (
            <div className="mt-3">
              <Button intent="secondary" disabled={busy} onClick={() => void controller.execute()}>
                요청 결과 다시 확인
              </Button>
            </div>
          )}
          {query.isError && notice && !busy && (
            <p className="mt-2">최신 상태를 확인하지 못했어요. 연결 후 다시 불러와 주세요.</p>
          )}
        </div>
      )}
      {view.pet ? (
        <PetRoom
          view={view}
          disabled={busy || uncertain}
          reaction={controller.reaction}
          onRefresh={() => void query.refetch()}
          onAction={(action) => {
            if (!view.pet || !view.actions?.[action].allowed) return
            void controller.execute({
              kind: 'actions',
              body: {
                action,
                expectedRevision: view.pet.revision,
                idempotencyKey: petRequestKey(),
              },
            })
          }}
        />
      ) : (
        <PetAdoption
          session={session}
          initialSourceJobId={initialSourceJobId}
          disabled={busy || uncertain}
          onAdopt={(command) => void controller.execute(command)}
        />
      )}
      {!uncertain && (
        <div className="flex justify-center">
          <Button
            intent="ghost"
            disabled={busy || query.isFetching}
            onClick={() => void query.refetch()}
          >
            {query.isFetching ? '확인하는 중…' : '최신 상태 불러오기'}
          </Button>
        </div>
      )}
    </div>
  )
}

export function PetPage({ initialSourceJobId }: { initialSourceJobId?: string }) {
  const config = useQuery(petConfigOptions)
  const session = usePetSession()
  const returnTo = `/playground/pet${initialSourceJobId ? `?sourceJobId=${encodeURIComponent(initialSourceJobId)}` : ''}`
  return (
    <div className="mx-auto w-full max-w-[68rem] space-y-6 px-5 pt-4 pb-20 tab:px-8 tab:pt-6 pc:px-10">
      <Link
        href="/playground"
        className="inline-flex min-h-11 items-center font-semibold text-brand focus-ring"
      >
        ← 놀이터
      </Link>
      <FeatureIntro eyebrow="함께 자라는 작은 일상" title="내 도트 친구">
        내 사진에서 태어난 친구와 오늘도 반가운 인사를 나눠요.
      </FeatureIntro>
      {config.isPending ? (
        <p role="status" className="py-10 text-center text-neutral-700">
          도트 친구를 만나러 가는 중…
        </p>
      ) : config.isError ? (
        <div role="alert" className="space-y-4 rounded-xl bg-point-50 p-6">
          <p>도트 친구를 불러오지 못했어요.</p>
          <Button intent="secondary" onClick={() => void config.refetch()}>
            다시 확인하기
          </Button>
        </div>
      ) : !config.data?.enabled ? (
        <p role="status" className="rounded-xl bg-point-50 p-6 text-neutral-700">
          도트 친구가 잠시 쉬고 있어요. 놀이터에서 다시 만나요.
        </p>
      ) : !session ? (
        <section className="rounded-2xl border border-secondary-200 bg-point-50 px-5 py-10 text-center">
          <PawPrintIcon aria-hidden className="mx-auto size-16 text-secondary-500" />
          <h2 className="mt-5 font-cafe24 text-xl text-neutral-850">
            우리 아이를 닮은 친구를 만나 보세요
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-700">
            완성한 AI 도트 그림에 이름을 짓고
            <br />
            밥도 먹고, 놀고, 쉬며 함께 자라요.
            <br />
            로그인하면 내 친구를 계속 만날 수 있어요.
          </p>
          <div className="mt-6">
            <Link
              href={`/login?returnUrl=${encodeURIComponent(returnTo)}`}
              className={buttonVariants()}
            >
              로그인하고 친구 만나기
            </Link>
          </div>
        </section>
      ) : (
        <PetSessionContent
          key={session.scope}
          session={session}
          initialSourceJobId={initialSourceJobId}
        />
      )}
    </div>
  )
}
