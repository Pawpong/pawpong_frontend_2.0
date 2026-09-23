import { z } from 'zod'

export const deletionStatusSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'retryable', 'review_required', 'completed']),
  requestedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  appleConnectionRemovalRequired: z.boolean(),
})
export type DeletionStatus = z.infer<typeof deletionStatusSchema>

export const deletionReceiptSchema = z.object({
  requestId: z
    .string()
    .uuid()
    .refine((value) => value[14] === '4'),
  receiptToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
})

export const deletionRequestSchema = z.object({
  confirmation: z.literal('DELETE_PERMANENTLY'),
})

export const deletionResponseSchema = z.object({
  success: z.literal(true),
  data: deletionStatusSchema,
})

export function deletionErrorMessage(status: number): string {
  if (status === 400) return '삭제 안내를 읽고 확인 항목에 동의해 주세요.'
  if (status === 401) return '다시 로그인한 뒤 삭제를 요청해 주세요.'
  if (status === 409)
    return '이미 영구삭제가 접수된 계정이에요. 접수한 브라우저에서 처리 상태를 확인해 주세요.'
  if (status === 429) return '요청이 많아요. 잠시 후 다시 확인해 주세요.'
  return '서버와 연결하지 못했어요. 접수 여부를 먼저 확인한 뒤 다시 시도해 주세요.'
}
