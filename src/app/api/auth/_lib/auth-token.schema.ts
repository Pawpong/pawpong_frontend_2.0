import { z } from 'zod'
import { AUTH_TOKEN_MAX_LENGTH } from '../_constants/auth-bff'

const token = z
  .string()
  .min(1)
  .max(AUTH_TOKEN_MAX_LENGTH)
  .regex(/^[A-Za-z0-9._~-]+$/)

export const authCookieTokensSchema = z.object({ accessToken: token, refreshToken: token })

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
