'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getPet,
  getPetConfig,
  latestPetView,
  petErrorMessage,
  runPetCommand,
  type PetCommand,
  type PetView,
  type PetGameOutcome,
  type PetAction,
} from '@/entities/playground-pet'
import { PetCommandQueue } from '@/entities/playground-pet/model/commandQueue'
import { inPetSession, petSessionIsCurrent, type PetSession } from './usePetSession'

export const petConfigOptions = {
  queryKey: ['playground-pet', 'config'],
  queryFn: ({ signal }: { signal: AbortSignal }) => getPetConfig(signal),
  staleTime: 30_000,
  refetchOnWindowFocus: true,
  retry: false,
  throwOnError: false,
} as const

export const petPrivateKey = (session: PetSession) =>
  ['playground-pet', 'private', session.scope] as const

export function usePetController(session: PetSession) {
  const client = useQueryClient()
  const queryKey = [...petPrivateKey(session), 'me']
  const [busy, setBusy] = useState(false)
  const [uncertain, setUncertain] = useState(false)
  const [notice, setNotice] = useState('')
  const [reaction, setReaction] = useState(0)
  const [gameOutcome, setGameOutcome] = useState<PetGameOutcome | null>(null)
  const [feedback, setFeedback] = useState<{
    action: PetAction | 'adopt' | null
    stars: number
    xp: number
  }>({ action: null, stars: 0, xp: 0 })
  const requestLocked = useRef(false)
  // PetPage가 scope마다 다시 마운트되어 이전 계정의 명령을 재사용하지 않는다.
  const [queue] = useState(
    () =>
      new PetCommandQueue((command, signal) =>
        inPetSession(session, () => runPetCommand(command, signal)),
      ),
  )
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => inPetSession(session, () => getPet(signal)),
    enabled: !busy && !uncertain,
    retry: false,
    throwOnError: false,
    gcTime: 0,
    staleTime: 0,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    structuralSharing: (old, incoming) =>
      latestPetView(old as PetView | undefined, incoming as PetView),
  })

  useEffect(() => {
    queue.activate()
    const key = petPrivateKey(session)
    return () => {
      queue.dispose()
      client.removeQueries({ queryKey: key })
    }
  }, [client, session, queue]) // 세션별 비공개 데이터는 화면 이탈/계정 변경 때 폐기한다.

  async function execute(command?: PetCommand) {
    if (requestLocked.current || queue.isRunning || busy || (uncertain && command)) return
    requestLocked.current = true
    try {
      setBusy(true)
      setNotice('')
      await client.cancelQueries({ queryKey })
      const result = await queue.run(command)
      if (!petSessionIsCurrent(session) || queue.isDisposed) return
      if (result.type === 'success') {
        client.setQueryData<PetView>(queryKey, (current) => latestPetView(current, result.data))
        setUncertain(false)
        setReaction((value) => value + 1)
        const { outcome, gameOutcome } = result.data
        setFeedback({
          action: outcome?.action ?? null,
          stars: outcome?.starsAwarded ?? Math.max(0, gameOutcome?.starsDelta ?? 0),
          xp: outcome?.xpAwarded ?? 0,
        })
        if (gameOutcome) {
          setGameOutcome(gameOutcome)
          setNotice(
            gameOutcome.kind === 'purchase'
              ? '새 소품을 인벤토리에 넣었어요.'
              : gameOutcome.kind === 'equip'
                ? '우리 아이의 방을 저장했어요.'
                : gameOutcome.kind === 'cancel'
                  ? '게임을 종료했어요. 별사탕은 지급되지 않아요.'
                  : gameOutcome.kind === 'finish'
                    ? `게임 완료! ${gameOutcome.score ?? 0}점 · 별사탕 ${gameOutcome.starsDelta}개를 받았어요.`
                    : gameOutcome.kind === 'start'
                      ? '게임을 시작했어요!'
                      : '',
          )
        } else if (outcome) {
          const { action, xpAwarded, starsAwarded = 0 } = outcome
          setNotice(
            action === 'adopt'
              ? '함께하는 첫날이에요! 인사부터 나눠 볼까요?'
              : action === 'rest'
                ? '포근하게 쉬기 시작했어요. 15분 뒤 에너지를 채워요.'
                : xpAwarded > 0 || starsAwarded > 0
                  ? `함께한 시간으로 ${xpAwarded} EXP · 별사탕 ${starsAwarded}개를 얻었어요.`
                  : '마음을 전했어요. 오늘의 보상은 이미 받았어요.',
          )
        }
        // 재전송 원 응답의 serverTime/revision은 과거일 수 있다. 항상 최신 view를 받는다.
        await query.refetch()
        void client.invalidateQueries({ queryKey: [...petPrivateKey(session), 'eligible'] })
      } else if (result.type !== 'busy') {
        setUncertain(result.type === 'uncertain')
        setNotice(
          result.type === 'uncertain'
            ? '연결이 끊겨 결과를 확인하지 못했어요. 아래에서 요청 결과를 다시 확인해 주세요.'
            : petErrorMessage(result.error.status, result.error.message),
        )
        if (result.type === 'rejected') {
          await query.refetch()
          void client.invalidateQueries({ queryKey: [...petPrivateKey(session), 'eligible'] })
          if (result.error.status === 404)
            void client.invalidateQueries({ queryKey: petConfigOptions.queryKey })
        }
      }
      return result
    } finally {
      requestLocked.current = false
      // A changed scope mounts a different controller; an expired cookie may leave this one mounted.
      setBusy(false)
    }
  }

  return { query, busy, uncertain, notice, reaction, feedback, gameOutcome, execute }
}
