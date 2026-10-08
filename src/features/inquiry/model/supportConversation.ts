import { z } from 'zod'
import type { SupportTopic } from './supportTopics'

export type SupportAudience = 'adopter' | 'breeder'

export const supportConversationSchema = z.object({
  conversationId: z.string().uuid(),
  category: z.enum(['usage', 'error', 'account', 'feedback', 'level_exp']),
  userType: z.enum(['adopter', 'breeder']),
  revision: z.number().int().nonnegative(),
  completedRequestIds: z.array(z.string()).default([]),
  pendingRequestId: z.string().nullable().default(null),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
      createdAt: z.string(),
      clientRequestId: z.string().optional(),
    }),
  ),
  draft: z
    .object({
      title: z.string(),
      summary: z.string(),
      conditions: z.array(z.string()),
      additionalInfo: z.array(z.string()),
    })
    .nullable(),
  sources: z
    .array(z.object({ faqId: z.string(), question: z.string(), answer: z.string() }))
    .default([]),
  needsHumanSupport: z.boolean().default(false),
  submission: z
    .object({
      status: z.literal('accepted'),
      deliveryStatus: z.enum(['pending', 'delivered', 'failed']),
      referenceCode: z.string().optional(),
    })
    .nullable(),
  expiresAt: z.string(),
})

export type SupportConversation = z.infer<typeof supportConversationSchema>
export type SupportTurn = { clientRequestId: string; revision: number; message: string }
export type SupportChatApi = {
  create: (category: SupportTopic, audience: SupportAudience) => Promise<SupportConversation>
  turn: (id: string, turn: SupportTurn) => Promise<SupportConversation>
  get: (id: string) => Promise<SupportConversation>
  submit: (id: string, revision: number) => Promise<SupportConversation>
  forget: (id: string) => Promise<void>
}

export class SupportChatError extends Error {
  constructor(
    public readonly status: number,
    public readonly code?: string,
  ) {
    super('AI 문의 요청을 완료하지 못했습니다.')
    this.name = 'SupportChatError'
  }
}
