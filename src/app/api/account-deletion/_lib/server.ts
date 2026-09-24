import { NextRequest, NextResponse } from 'next/server'
import { deletionErrorMessage, deletionReceiptSchema } from '@/shared/lib/accountDeletion'

export { isSameOriginRequest as isSameOrigin } from '@/shared/lib/server/sameOrigin'

export const NO_STORE = { 'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache' }
export const RECEIPT_COOKIE = 'pawpongDeletionReceipt'
export const RECEIPT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/account-deletion',
  maxAge: 60 * 60 * 24 * 365,
}

export function failure(status: number) {
  return NextResponse.json(
    { success: false, message: deletionErrorMessage(status) },
    { status, headers: NO_STORE },
  )
}

export function readReceipt(request: NextRequest) {
  try {
    return deletionReceiptSchema.safeParse(
      JSON.parse(request.cookies.get(RECEIPT_COOKIE)?.value ?? 'null'),
    )
  } catch {
    return deletionReceiptSchema.safeParse(null)
  }
}

export function backendRequest(
  request: NextRequest,
  path: '' | '/status',
  body: unknown,
  accessToken?: string,
) {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080').replace(/\/+$/, '')
  return fetch(`${base}/api/v2/account-deletion${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
    credentials: 'omit',
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.any([request.signal, AbortSignal.timeout(15_000)]),
  })
}

export function upstreamFailure(status: number) {
  return failure([400, 401, 404, 409, 429, 503].includes(status) ? status : 502)
}
