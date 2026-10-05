'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/shared/api/unwrap'
import { Button, buttonVariants } from '@/shared/ui/Button'
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
          우리 아이의 방을 준비하고 있어요…
        </p>
      )
    const unavailable = query.error instanceof ApiError && query.error.status === 404
    return (
      <div role="alert" className="space-y-4 rounded-2xl border border-secondary-200 p-6">
        <p>
          {unavailable
            ? '반려동물 키우기를 잠시 이용할 수 없어요. 놀이터에서 다시 만나요.'
            : '우리 아이의 방을 불러오지 못했어요. 저장된 돌봄 기록은 그대로 있어요.'}
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
      {view.pet ? (
        <PetRoom
          initialCharacterSourceId={initialSourceJobId}
          view={view}
          session={session}
          disabled={busy || uncertain || query.isError}
          reaction={controller.reaction}
          gameOutcome={controller.gameOutcome}
          feedback={controller.feedback}
          operation={{
            busy,
            uncertain,
            notice:
              notice || (query.isError ? '최신 상태를 확인하지 못했어요. 다시 불러와 주세요.' : ''),
            onRetry: () => void controller.execute(),
          }}
          onRefresh={() => void query.refetch()}
          onCommand={controller.execute}
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
      {!view.pet && (notice || busy || query.isError) && (
        <div
          role={uncertain || query.isError ? 'alert' : 'status'}
          aria-live="polite"
          className="rounded-xl border border-secondary-200 bg-point-50 px-5 py-4 text-sm leading-6 text-neutral-850"
        >
          <p>
            {busy
              ? '우리 아이에게 마음을 전하고 있어요…'
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
      <div>
        <h1 className="font-cafe24 text-xl text-neutral-850 tab:text-2xl">내 반려동물 키우기</h1>
        <p className="mt-2 text-sm text-neutral-700">우리 아이와 함께하는 작은 도트 세상</p>
      </div>
      {config.isPending ? (
        <p role="status" className="py-10 text-center text-neutral-700">
          우리 아이를 만나러 가는 중…
        </p>
      ) : config.isError ? (
        <div role="alert" className="space-y-4 rounded-xl bg-point-50 p-6">
          <p>반려동물 키우기를 불러오지 못했어요.</p>
          <Button intent="secondary" onClick={() => void config.refetch()}>
            다시 확인하기
          </Button>
        </div>
      ) : !config.data?.enabled ? (
        <p role="status" className="rounded-xl bg-point-50 p-6 text-neutral-700">
          반려동물 키우기를 잠시 이용할 수 없어요. 놀이터에서 다시 만나요.
        </p>
      ) : !session ? (
        <section className="rounded-2xl border border-secondary-200 bg-point-50 px-5 py-10 text-center">
          <PawPrintIcon aria-hidden className="mx-auto size-16 text-secondary-500" />
          <h2 className="mt-5 font-cafe24 text-xl text-neutral-850">
            우리 아이와 새로운 일상을 시작해요
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-700">
            완성된 도트 그림을 고르고 이름을 지어 주세요.
            <br />
            인사하고, 밥 주고, 함께 놀며 조금씩 자라요.
            <br />
            로그인하면 키우던 반려동물을 언제든 다시 만날 수 있어요.
          </p>
          <div className="mt-6">
            <Link
              href={`/login?returnUrl=${encodeURIComponent(returnTo)}`}
              className={buttonVariants()}
            >
              로그인하고 시작하기
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
