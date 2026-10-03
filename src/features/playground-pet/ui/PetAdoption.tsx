'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  getEligiblePetImages,
  isValidPetName,
  normalizePetName,
  type PetCommand,
} from '@/entities/playground-pet'
import { Button, buttonVariants } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { PawPrintIcon, PixelCheckIcon } from '@/shared/assets'
import { inPetSession, type PetSession } from '../lib/usePetSession'
import { petPrivateKey } from '../lib/usePetController'
import { petRequestKey } from '../lib/useServerClock'
import { PetImage } from './PetImage'

export function PetAdoption({
  session,
  initialSourceJobId,
  disabled,
  onAdopt,
}: {
  session: PetSession
  initialSourceJobId?: string
  disabled: boolean
  onAdopt: (command: PetCommand) => void
}) {
  const [selectedId, setSelectedId] = useState(initialSourceJobId ?? '')
  const [name, setName] = useState('')
  const candidates = useInfiniteQuery({
    queryKey: [...petPrivateKey(session), 'eligible'],
    queryFn: ({ pageParam, signal }) =>
      inPetSession(session, () => getEligiblePetImages(pageParam, signal)),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    retry: false,
    throwOnError: false,
    gcTime: 0,
  })
  const images = candidates.data?.pages.flatMap((page) => page.images) ?? []
  const selected = images.find((image) => image.sourceJobId === selectedId)
  const nameValid = isValidPetName(name)
  return (
    <section
      aria-labelledby="adopt-heading"
      className="rounded-2xl border border-secondary-200 bg-base-white p-5 tab:p-8"
    >
      <h2 id="adopt-heading" className="font-cafe24 text-xl text-neutral-850 tab:text-2xl">
        어떤 친구와 함께할까요?
      </h2>
      <ol className="mt-4 grid gap-2 text-sm text-neutral-700 tab:grid-cols-3">
        {['우리 아이 사진 고르기', 'AI 도트 그림 완성하기', '이름 짓고 친구 맞이하기'].map(
          (step, index) => (
            <li key={step} className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-point-100 text-xs font-semibold text-brand">
                {index + 1}
              </span>
              {step}
            </li>
          ),
        )}
      </ol>
      <p className="mt-5 text-sm leading-6 text-neutral-700">
        내 보관함에서 입양 가능한 도트 그림만 모았어요. 한 계정에서 한 친구와 함께해요.
      </p>
      {candidates.isPending ? (
        <p role="status" className="py-12 text-center text-neutral-700">
          도트 친구를 데려오고 있어요…
        </p>
      ) : candidates.isError ? (
        <div role="alert" className="space-y-4 py-8">
          <p>입양 가능한 사진을 불러오지 못했어요.</p>
          <Button intent="secondary" onClick={() => void candidates.refetch()}>
            다시 불러오기
          </Button>
        </div>
      ) : images.length === 0 && !candidates.hasNextPage ? (
        <div className="mt-6 rounded-xl bg-point-50 px-5 py-9 text-center">
          <PawPrintIcon aria-hidden className="mx-auto size-12 text-secondary-500" />
          <h3 className="mt-4 font-cafe24 text-lg text-neutral-850">
            첫 도트 친구를 기다리고 있어요
          </h3>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            우리 아이 사진으로 AI 도트 그림을 완성해 주세요.
            <br />
            만든 그림이 준비되면 이곳에서 만날 수 있어요.
          </p>
          <div className="mt-5">
            <Link href="/ai-filter" className={buttonVariants()}>
              AI로 도트 친구 만들기
            </Link>
          </div>
          <p className="mt-3 text-xs leading-5 text-neutral-700">
            기존 AI 무료 이용 횟수로 만들어요.
            <br />
            모두 사용했다면 AI 화면의 다음 이용 안내를 확인해 주세요.
          </p>
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (selected && nameValid && !disabled)
              onAdopt({
                kind: 'adopt',
                body: {
                  sourceJobId: selected.sourceJobId,
                  name: normalizePetName(name),
                  idempotencyKey: petRequestKey(),
                },
              })
          }}
        >
          <fieldset disabled={disabled} className="mt-6">
            <legend className="mb-3 text-sm font-semibold text-neutral-850">
              1. 친구가 될 도트 그림
            </legend>
            <div className="grid grid-cols-2 gap-3 tab:grid-cols-3 pc:grid-cols-4">
              {images.map((image, index) => (
                <label key={image.sourceJobId} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="pet-image"
                    value={image.sourceJobId}
                    checked={selectedId === image.sourceJobId}
                    onChange={() => setSelectedId(image.sourceJobId)}
                    className="peer sr-only"
                    aria-label={`${index + 1}번째 도트 그림 선택`}
                  />
                  <span className="block aspect-square overflow-hidden rounded-xl border-2 border-secondary-100 bg-point-50 p-3 peer-checked:border-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-brand peer-disabled:opacity-60">
                    <PetImage
                      key={image.imageUrl}
                      src={image.imageUrl}
                      alt={`입양 가능한 ${index + 1}번째 도트 그림`}
                      compact
                    />
                  </span>
                  {selectedId === image.sourceJobId && (
                    <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded bg-action-primary px-2 py-1 text-xs font-semibold text-brand">
                      <PixelCheckIcon aria-hidden className="size-3" />
                      선택
                    </span>
                  )}
                </label>
              ))}
            </div>
            {candidates.hasNextPage && (
              <div className="mt-4">
                <Button
                  intent="secondary"
                  width="full"
                  disabled={candidates.isFetchingNextPage}
                  onClick={() => void candidates.fetchNextPage()}
                >
                  {candidates.isFetchingNextPage ? '불러오는 중…' : '사진 더 보기'}
                </Button>
              </div>
            )}
            <div className="mt-7">
              <label htmlFor="pet-name" className="text-sm font-semibold text-neutral-850">
                2. 친구의 이름
              </label>
              <Input
                id="pet-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={24}
                autoComplete="off"
                placeholder="도토리"
                className="mt-2 h-12"
                aria-describedby="pet-name-help"
                aria-invalid={!!name && !nameValid}
              />
              <p id="pet-name-help" className="mt-2 text-xs text-neutral-700">
                1~12자로 지어 주세요. {Array.from(normalizePetName(name)).length}/12
              </p>
            </div>
            {selected && (
              <div className="mt-6 flex items-center gap-4 rounded-xl bg-point-50 p-4">
                <div className="size-20 shrink-0">
                  <PetImage
                    key={selected.imageUrl}
                    src={selected.imageUrl}
                    alt="입양할 친구 미리보기"
                    compact
                  />
                </div>
                <p className="text-sm leading-6 text-neutral-850">
                  <strong>{normalizePetName(name) || '새 친구'}</strong>와 오늘부터 함께해요.
                  <br />
                  입양한 친구는 새로고침해도 그대로 있어요.
                </p>
              </div>
            )}
            <div className="mt-6">
              <Button type="submit" width="full" disabled={!selected || !nameValid || disabled}>
                {disabled ? '친구를 맞이하는 중…' : '이 친구와 시작하기'}
              </Button>
            </div>
          </fieldset>
        </form>
      )}
    </section>
  )
}
