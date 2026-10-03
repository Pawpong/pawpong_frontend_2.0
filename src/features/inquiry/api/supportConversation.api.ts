import {
  SupportChatError,
  supportConversationSchema,
  type SupportChatApi,
} from '../model/supportConversation'

const BASE = '/api/support/conversations'

async function request(path: string, body?: unknown) {
  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(65_000),
    })
  } catch {
    throw new SupportChatError(0)
  }
  const envelope = await response.json().catch(() => null)
  if (!response.ok || !envelope?.success) {
    throw new SupportChatError(response.status, envelope?.errorCode ?? envelope?.code)
  }
  const parsed = supportConversationSchema.safeParse(envelope.data)
  if (!parsed.success) throw new SupportChatError(502)
  return parsed.data
}

// 대화 capability는 BFF의 HttpOnly 쿠키에만 존재한다. 로그인 refresh와도 분리한다.
export const supportChatApi: SupportChatApi = {
  forget: async (id) => {
    await fetch(`${BASE}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
      cache: 'no-store',
    })
  },
  create: (category, userType) => request('', { category, userType, consent: true }),
  turn: (id, turn) => request(`/${encodeURIComponent(id)}/turns`, turn),
  get: (id) => request(`/${encodeURIComponent(id)}`),
  submit: (id, revision) =>
    request(`/${encodeURIComponent(id)}/submit`, { revision, consent: true }),
}
