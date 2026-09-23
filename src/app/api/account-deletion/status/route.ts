import { NextRequest, NextResponse } from 'next/server'
import { deletionResponseSchema } from '@/shared/lib/accountDeletion'
import {
  backendRequest,
  failure,
  isSameOrigin,
  NO_STORE,
  readReceipt,
  RECEIPT_COOKIE,
  RECEIPT_COOKIE_OPTIONS,
  upstreamFailure,
} from '../_lib/server'

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return failure(403)
  const receipt = readReceipt(request)
  if (!receipt.success)
    return NextResponse.json(
      { success: false, message: '이 브라우저에 저장된 삭제 접수 내역이 없어요.' },
      { status: 404, headers: NO_STORE },
    )
  try {
    // 본문/URL에 전달된 다른 영수증·사용자 정보는 사용하지 않는다.
    const response = await backendRequest(request, '/status', receipt.data)
    if (!response.ok) return upstreamFailure(response.status)
    const result = deletionResponseSchema.safeParse(await response.json())
    if (!result.success || result.data.data.requestId !== receipt.data.requestId)
      return failure(502)
    return NextResponse.json(result.data, { headers: NO_STORE })
  } catch {
    return failure(503)
  }
}

/** 완료 내역을 닫아 다른 계정으로 전환할 때만 브라우저 영수증을 지운다. 서버 작업은 취소하지 않는다. */
export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return failure(403)
  const response = NextResponse.json({ success: true }, { headers: NO_STORE })
  response.cookies.set(RECEIPT_COOKIE, '', { ...RECEIPT_COOKIE_OPTIONS, maxAge: 0 })
  return response
}
