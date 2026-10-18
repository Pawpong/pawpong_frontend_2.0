import { z } from 'zod'

const serverDate = z.string().refine((value) => Number.isFinite(Date.parse(value)))
const configSchema = z.object({
  enabled: z.boolean(),
  failureThreshold: z.number().int().positive(),
  codeTtlSeconds: z.number().int().positive(),
  resendSeconds: z.number().int().positive(),
  proofTtlSeconds: z.number().int().positive(),
})
const challengeSchema = z
  .object({
    challengeId: z.string().regex(/^[a-f0-9]{64}$/),
    expiresAt: serverDate,
    nextSendAt: serverDate,
    serverTime: serverDate,
  })
  .refine((value) => Date.parse(value.expiresAt) > Date.parse(value.serverTime))
const proofSchema = z
  .object({
    emailVerificationToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    expiresAt: serverDate,
    serverTime: serverDate,
  })
  .refine((value) => Date.parse(value.expiresAt) > Date.parse(value.serverTime))

export type EmailVerificationConfig = z.infer<typeof configSchema>
export type EmailChallenge = z.infer<typeof challengeSchema>
export type EmailVerificationProof = z.infer<typeof proofSchema>

const parse = <T>(schema: z.ZodType<T>, data: unknown): T => {
  const result = schema.safeParse(data)
  if (!result.success) throw new Error('이메일 인증 응답을 확인하지 못했습니다. 다시 시도해주세요.')
  return result.data
}

export const parseEmailConfig = (data: unknown) => parse(configSchema, data)
export const parseEmailChallenge = (data: unknown) => parse(challengeSchema, data)
export const parseEmailProof = (data: unknown) => parse(proofSchema, data)
