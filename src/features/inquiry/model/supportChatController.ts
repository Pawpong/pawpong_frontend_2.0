import { SUPPORT_TOPICS, MAX_SUPPORT_MESSAGE_LENGTH, type SupportTopic } from './supportTopics'
import {
  SupportChatError,
  type SupportAudience,
  type SupportChatApi,
  type SupportConversation,
  type SupportTurn,
} from './supportConversation'

type Recovery = 'retry' | 'refresh' | 'restart'
export type SupportSession = {
  draft: string
  consent: boolean
  conversation: SupportConversation | null
  pendingTurn: SupportTurn | null
  submissionRevision: number | null
  phase: 'idle' | 'sending' | 'submitting' | 'refreshing'
  error: { message: string; recovery: Recovery } | null
}

const emptySession = (): SupportSession => ({
  draft: '',
  consent: false,
  conversation: null,
  pendingTurn: null,
  submissionRevision: null,
  phase: 'idle',
  error: null,
})
const initialState = () =>
  Object.fromEntries(SUPPORT_TOPICS.map(({ id }) => [id, emptySession()])) as Record<
    SupportTopic,
    SupportSession
  >

/** 카테고리별 초안과 요청 식별자를 보존하고 React 렌더 전 연속 클릭도 차단한다. */
export class SupportChatController {
  private state = initialState()
  private listeners = new Set<() => void>()

  constructor(
    private api: SupportChatApi,
    private audience: SupportAudience,
  ) {}

  getSnapshot = () => this.state
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
  private update(topic: SupportTopic, changes: Partial<SupportSession>) {
    this.state = { ...this.state, [topic]: { ...this.state[topic], ...changes } }
    this.listeners.forEach((listener) => listener())
  }
  setDraft(topic: SupportTopic, draft: string) {
    this.update(topic, { draft: draft.slice(0, MAX_SUPPORT_MESSAGE_LENGTH) })
  }
  setConsent(topic: SupportTopic, consent: boolean) {
    this.update(topic, { consent })
  }

  restart(topic: SupportTopic) {
    const session = this.state[topic]
    if (session.phase !== 'idle') return
    // 실패한 작성 내용은 새 대화에서도 유지한다. 이전 대화에 접근하는 쿠키만 폐기한다.
    if (session.conversation)
      void this.api.forget(session.conversation.conversationId).catch(() => {})
    this.update(topic, { ...emptySession(), draft: session.draft, consent: session.consent })
  }

  async send(topic: SupportTopic) {
    const session = this.state[topic]
    if (
      session.phase !== 'idle' ||
      !session.consent ||
      session.conversation?.submission ||
      session.submissionRevision !== null
    )
      return
    const message = session.pendingTurn?.message ?? session.draft.trim()
    if (!message) return
    const attempt = session.pendingTurn ?? {
      clientRequestId: crypto.randomUUID(),
      revision: session.conversation?.revision ?? 0,
      message,
    }
    this.update(topic, { phase: 'sending', pendingTurn: attempt, error: null })
    try {
      let conversation = session.conversation
      if (!conversation) {
        conversation = await this.api.create(topic, this.audience)
        this.update(topic, { conversation })
      }
      const result = await this.api.turn(conversation.conversationId, attempt)
      this.acceptTurn(topic, result, attempt)
    } catch (error) {
      await this.fail(topic, error, 'AI 답변을 받지 못했어요. 작성 내용은 그대로예요.')
    } finally {
      this.update(topic, { phase: 'idle' })
    }
  }

  private acceptTurn(topic: SupportTopic, conversation: SupportConversation, attempt: SupportTurn) {
    this.update(topic, {
      conversation,
      pendingTurn: null,
      error: null,
      draft: this.state[topic].draft.trim() === attempt.message ? '' : this.state[topic].draft,
    })
  }

  async submit(topic: SupportTopic) {
    const session = this.state[topic]
    const conversation = session.conversation
    if (
      session.phase !== 'idle' ||
      !conversation?.draft ||
      conversation.submission ||
      session.pendingTurn ||
      session.draft.trim()
    )
      return
    const revision = session.submissionRevision ?? conversation.revision
    this.update(topic, { phase: 'submitting', submissionRevision: revision, error: null })
    try {
      const result = await this.api.submit(conversation.conversationId, revision)
      this.update(topic, { conversation: result, submissionRevision: null })
    } catch (error) {
      await this.fail(
        topic,
        error,
        '접수 결과를 확인하지 못했어요. 같은 문의로 다시 확인할 수 있어요.',
      )
    } finally {
      this.update(topic, { phase: 'idle' })
    }
  }

  async refresh(topic: SupportTopic) {
    const session = this.state[topic]
    if (session.phase !== 'idle' || !session.conversation) return
    this.update(topic, { phase: 'refreshing', error: null })
    try {
      const conversation = await this.api.get(session.conversation.conversationId)
      this.update(topic, { conversation })
      if (conversation.submission) this.update(topic, { submissionRevision: null })
      const attempt = session.pendingTurn
      if (attempt && conversation.completedRequestIds.includes(attempt.clientRequestId)) {
        this.acceptTurn(topic, conversation, attempt)
      }
    } catch (error) {
      const expired = error instanceof SupportChatError && [401, 410].includes(error.status)
      this.update(topic, {
        error: {
          message: expired
            ? '이 대화를 이어갈 수 없어요. 작성 내용으로 새 대화를 시작해 주세요.'
            : session.conversation.submission
              ? '접수 내역은 유지돼요. 전달 상태는 잠시 후 다시 확인해 주세요.'
              : '대화 상태를 확인하지 못했어요. 잠시 후 다시 확인해 주세요.',
          recovery: expired ? 'restart' : 'refresh',
        },
      })
    } finally {
      this.update(topic, { phase: 'idle' })
    }
  }

  private async fail(topic: SupportTopic, error: unknown, fallback: string) {
    const status = error instanceof SupportChatError ? error.status : 0
    const code = error instanceof SupportChatError ? error.code : undefined
    if ([401, 410].includes(status) || code === 'TURN_LIMIT') {
      this.update(topic, {
        error: {
          message: '이 대화를 이어갈 수 없어요. 작성 내용으로 새 대화를 시작해 주세요.',
          recovery: 'restart',
        },
      })
      return
    }
    if (
      status === 409 &&
      ['REVISION_CONFLICT', 'CONVERSATION_SUBMITTED', 'REQUEST_ID_CONFLICT', 'DRAFT_REQUIRED'].includes(
        code ?? '',
      )
    ) {
      const session = this.state[topic]
      if (session.conversation) {
        try {
          const conversation = await this.api.get(session.conversation.conversationId)
          const attempt = session.pendingTurn
          if (attempt && conversation.completedRequestIds.includes(attempt.clientRequestId)) {
            this.acceptTurn(topic, conversation, attempt)
          } else if (conversation.pendingRequestId) {
            this.update(topic, {
              conversation,
              error: {
                message: '이전 요청을 확인하고 있어요. 잠시 후 같은 요청으로 다시 시도해 주세요.',
                recovery: 'retry',
              },
            })
          } else {
            this.update(topic, {
              conversation,
              pendingTurn: null,
              submissionRevision: null,
              error: conversation.submission
                ? null
                : {
                    message:
                      '대화가 갱신됐어요. 최신 내용을 확인한 뒤 작성 내용을 다시 보내 주세요.',
                    recovery: 'refresh',
                  },
            })
          }
          return
        } catch {
          /* 원래 요청과 초안을 보존한다. */
        }
      }
    }
    this.update(topic, {
      error: {
        message:
          status === 429
            ? '문의가 잠시 몰렸어요. 1분 정도 기다렸다가 다시 보내 주세요.'
            : status === 409
              ? '이전 요청을 확인하고 있어요. 잠시 후 같은 요청으로 다시 시도해 주세요.'
              : fallback,
        recovery: 'retry',
      },
    })
  }
}
