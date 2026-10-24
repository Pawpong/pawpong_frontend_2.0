/**
 * 입양 신청서 임시저장 — 이 기기(localStorage)에 계정·분양글별로 둔다.
 * 개인정보 동의 전 입력값이라 서버로 보내지 않는다. 동의 체크(boolean)는 저장하지 않고 글자 입력만 남긴다.
 * USER_DRAFT_PREFIX 로 시작하는 키는 로그아웃·탈퇴 때 한꺼번에 지운다 (authSessionLifecycle).
 */

import { USER_DRAFT_PREFIX } from '@/shared/lib/authSessionLifecycle'

type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export interface ApplicationDraft {
  values: Record<string, string>
  customAnswers: Record<string, string>
}

const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000

export const applicationDraftKey = (userId: string, petId: string) =>
  `${USER_DRAFT_PREFIX}application:${encodeURIComponent(userId)}:${encodeURIComponent(petId)}`

/** 사생활 보호 모드처럼 저장소 접근 자체가 막힌 환경에서는 저장 없이 동작한다 */
export const getDraftStorage = (): DraftStorage | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

const onlyFilledStrings = (source: unknown): Record<string, string> => {
  if (!source || typeof source !== 'object') return {}
  return Object.fromEntries(
    Object.entries(source).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === 'string' && entry[1].trim().length > 0,
    ),
  )
}

export const readApplicationDraft = (
  storage: DraftStorage | null,
  key: string,
  now = Date.now(),
): ApplicationDraft | null => {
  try {
    const raw = storage?.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      savedAt?: unknown
      values?: unknown
      customAnswers?: unknown
    }
    if (typeof parsed.savedAt !== 'number' || now - parsed.savedAt > DRAFT_TTL_MS) {
      storage?.removeItem(key)
      return null
    }
    const draft = {
      values: onlyFilledStrings(parsed.values),
      customAnswers: onlyFilledStrings(parsed.customAnswers),
    }
    return Object.keys(draft.values).length || Object.keys(draft.customAnswers).length
      ? draft
      : null
  } catch {
    return null
  }
}

/** 채운 글자가 하나도 없으면 저장 대신 지운다 — 빈 신청서를 '불러왔어요'로 띄우지 않는다 */
export const writeApplicationDraft = (
  storage: DraftStorage | null,
  key: string,
  values: object,
  customAnswers: Record<string, string>,
  now = Date.now(),
) => {
  const draft = {
    values: onlyFilledStrings(values),
    customAnswers: onlyFilledStrings(customAnswers),
  }
  try {
    if (!Object.keys(draft.values).length && !Object.keys(draft.customAnswers).length) {
      storage?.removeItem(key)
      return
    }
    storage?.setItem(key, JSON.stringify({ savedAt: now, ...draft }))
  } catch {
    /* 용량 초과 등 — 저장만 건너뛰고 작성은 계속된다 */
  }
}

export const clearApplicationDraft = (storage: DraftStorage | null, key: string) => {
  try {
    storage?.removeItem(key)
  } catch {
    /* 저장소가 막힌 환경 */
  }
}
