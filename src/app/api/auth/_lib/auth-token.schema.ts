import { z } from 'zod'
import { AUTH_TOKEN_MAX_LENGTH } from '../_constants/auth-bff'

const token = z
  .string()
  .min(1)
  .max(AUTH_TOKEN_MAX_LENGTH)
  .regex(/^[A-Za-z0-9._~-]+$/)

export const authCookieTokensSchema = z.object({ accessToken: token, refreshToken: token })

/**
 * set-cookie 요청 — 소셜 로그인·가입이면 제공자를 함께 받아 '최근 사용' 쿠키로 심는다.
 * 모르는 값은 버린다(catch) — 표시용 값 때문에 로그인 쿠키 저장까지 실패하면 안 된다.
 */
export const authSetCookieBodySchema = authCookieTokensSchema.extend({
  provider: z.enum(['kakao', 'naver', 'google', 'apple']).optional().catch(undefined),
})

export const authRefreshResponseSchema = z.object({
  success: z.literal(true),
  code: z.number().optional(),
  message: z.string().optional(),
  timestamp: z.string().optional(),
  data: authCookieTokensSchema.extend({
    accessTokenExpiresIn: z.number().nonnegative().optional(),
    refreshTokenExpiresIn: z.number().nonnegative().optional(),
  }),
})
