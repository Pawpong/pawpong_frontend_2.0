import { NextResponse, type NextRequest } from 'next/server'

/**
 * [BFF] Sentry → Discord 알림 중계
 *
 * POST /api/sentry-discord?token=<SENTRY_WEBHOOK_TOKEN>
 *
 * Sentry 무료 플랜은 Discord 통합이 잠겨 있어(Team 이상), 무료로 열려 있는
 * 레거시 WebHooks 플러그인의 이슈 알림을 받아 Discord 웹훅 임베드로 변환해 전달한다.
 * - SENTRY_DISCORD_WEBHOOK_URL: Discord 채널 웹훅 URL (서버 전용 env)
 * - SENTRY_WEBHOOK_TOKEN: Sentry 쪽 콜백 URL 쿼리에 싣는 공유 시크릿
 */

const LEVEL_COLOR: Record<string, number> = {
  fatal: 0x8b0000,
  error: 0xe03e2f,
  warning: 0xf5a623,
  info: 0x3b82f6,
  debug: 0x9ca3af,
}

interface SentryEventLike {
  title?: string
  environment?: string
  release?: string
  level?: string
  culprit?: string
  web_url?: string
}

/** 레거시 WebHooks 와 내부 통합(issue alert) 두 형식을 모두 받는다. */
interface SentryPayload {
  project_name?: string
  project?: string
  level?: string
  message?: string
  culprit?: string
  url?: string
  event?: SentryEventLike
  data?: { event?: SentryEventLike & { project?: number }; triggered_rule?: string }
}

export async function POST(request: NextRequest) {
  const token = process.env.SENTRY_WEBHOOK_TOKEN
  if (!token || request.nextUrl.searchParams.get('token') !== token) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const webhookUrl = process.env.SENTRY_DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    return NextResponse.json({ ok: false, message: 'webhook 미설정' }, { status: 500 })
  }

  let payload: SentryPayload
  try {
    payload = (await request.json()) as SentryPayload
  } catch {
    return NextResponse.json({ ok: false, message: '잘못된 본문' }, { status: 400 })
  }

  // 내부 통합(issue alert)은 data.event 아래에, 레거시는 최상위에 필드가 실린다
  const event = payload.data?.event ?? payload.event
  const level = event?.level ?? payload.level ?? 'error'
  const title = event?.title ?? payload.message ?? '알 수 없는 오류'
  const url = event?.web_url ?? payload.url
  const culprit = event?.culprit ?? payload.culprit
  const fields = [
    { name: '프로젝트', value: payload.project_name ?? payload.project ?? 'pawpong-web', inline: true },
    { name: '레벨', value: level, inline: true },
    { name: '환경', value: event?.environment ?? '-', inline: true },
  ]
  if (culprit) fields.push({ name: '위치', value: culprit.slice(0, 900), inline: false })

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // 백엔드 오류 웹훅을 공유하므로 보낸이 이름으로 출처를 구분한다
      username: '포퐁 센트리 (프론트)',
      embeds: [
        {
          title: title.slice(0, 250),
          url,
          color: LEVEL_COLOR[level] ?? LEVEL_COLOR.error,
          fields,
          footer: { text: 'Sentry → Pawpong 중계' },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  })

  if (!res.ok) {
    console.error('Discord 웹훅 전달 실패:', res.status, await res.text().catch(() => ''))
    return NextResponse.json({ ok: false }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
