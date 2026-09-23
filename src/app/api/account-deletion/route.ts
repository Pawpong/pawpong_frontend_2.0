import { NextRequest, NextResponse } from 'next/server'
import {
  deletionResponseSchema,
  deletionRequestSchema,
  deletionStatusSchema,
} from '@/shared/lib/accountDeletion'
import { expireAuthCookies } from '@/shared/lib/server/authCookies'
import {
  backendRequest,
  failure,
  isSameOrigin,
  NO_STORE,
  readReceipt,
  upstreamFailure,
} from './_lib/server'

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return failure(403)
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json')
    return failure(400)
  const accessToken = request.cookies.get('accessToken')?.value
  if (!accessToken) return failure(401)
  const body = deletionRequestSchema.safeParse(await request.json().catch(() => null))
  if (!body.success) return failure(400)
  const receipt = readReceipt(request)
  if (!receipt.success) return failure(400)

  try {
    const response = await backendRequest(
      request,
      '',
      { ...body.data, ...receipt.data },
      accessToken,
    )
    if (!response.ok) {
      const failed = upstreamFailure(response.status)
      if (response.status === 401) expireAuthCookies(failed, request)
      return failed
    }
    const accepted = deletionResponseSchema.safeParse(await response.json())
    if (!accepted.success || accepted.data.data.requestId !== receipt.data.requestId)
      return failure(502)
    const result = NextResponse.json(
      { success: true, data: deletionStatusSchema.parse(accepted.data.data) },
      { headers: NO_STORE },
    )
    // 영수증은 /prepare 응답에서 이미 저장되었다. 접수 응답이 유실되어도 상태 조회가 가능하다.
    expireAuthCookies(result, request)
    return result
  } catch {
    return failure(503)
  }
}
