import { randomBytes, randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  failure,
  isSameOrigin,
  NO_STORE,
  readReceipt,
  RECEIPT_COOKIE,
  RECEIPT_COOKIE_OPTIONS,
} from '../_lib/server'

/** 계정 상태를 바꾸기 전에 영수증을 브라우저에 확정해 접수 응답 유실에도 조회할 수 있게 한다. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return failure(403)
  if (!request.cookies.get('accessToken')?.value) return failure(401)
  const existing = readReceipt(request)
  const receipt = existing.success
    ? existing.data
    : {
        requestId: randomUUID(),
        receiptToken: randomBytes(32).toString('base64url'),
      }
  const response = NextResponse.json({ success: true, prepared: true }, { headers: NO_STORE })
  response.cookies.set(RECEIPT_COOKIE, JSON.stringify(receipt), RECEIPT_COOKIE_OPTIONS)
  return response
}
