import { z } from 'zod'

export const reviewLoginRequestSchema = z.object({
  emailAddress: z.string().trim().toLowerCase().max(254).email(),
  // bcrypt는 바이트 단위로 제한한다. 공백도 비밀번호의 일부이므로 trim하지 않는다.
  password: z
    .string()
    .min(1)
    .refine((value) => new TextEncoder().encode(value).length <= 72),
})

export type ReviewLoginCredentials = z.infer<typeof reviewLoginRequestSchema>

export const reviewLoginResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
    expiresIn: z.number().positive(),
    user: z.object({
      userId: z.string().min(1),
      email: z.string().email(),
      role: z.enum(['adopter', 'breeder']),
      nickname: z.string(),
    }),
  }),
})

/** 인증 서버의 원문 오류·입력값은 브라우저로 전달하지 않는다. */
export function reviewLoginErrorMessage(status: number): string {
  if (status === 400) return '이메일과 비밀번호를 확인해 주세요.'
  if (status === 401) return '이메일 또는 비밀번호를 확인해 주세요.'
  if (status === 429) return '로그인 시도가 많아요. 잠시 후 다시 시도해 주세요.'
  return '로그인에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'
}
