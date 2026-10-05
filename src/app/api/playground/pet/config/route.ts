import { NextRequest, NextResponse } from 'next/server'
import { getPetServerConfig } from '@/features/playground-pet/lib/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store' }
  const result = await getPetServerConfig(request.headers.get('host') ?? '')
  return NextResponse.json(result.config, {
    ...(result.unavailable && { status: 503 }),
    headers,
  })
}
