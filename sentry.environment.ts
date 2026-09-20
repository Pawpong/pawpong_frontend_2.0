const PROD_HOSTS = ['pawpong.kr', 'www.pawpong.kr']
// 개발 수집은 배포된 dev 환경(dev.pawpong.kr)만 — localhost 작업 에러가 메일·디코 알림을 울리지 않게 한다
const DEV_REPORT_HOSTS = ['dev.pawpong.kr']

/** 로컬·프리뷰는 운영 DSN을 재사용하지 않고, localhost 는 아예 수집하지 않는다. */
export function resolveSentryEnvironment(input: {
  environment?: string
  nodeEnv?: string
  hostname?: string
  productionDsn?: string
  developmentDsn?: string
  enableDevelopment?: string
  /** 서버 런타임에서 Vercel 위인지 (로컬 next dev/start 는 false) — 클라이언트는 hostname 으로 판정 */
  onVercel?: boolean
}) {
  const local =
    input.hostname !== undefined && !PROD_HOSTS.includes(input.hostname)
  const environment =
    input.nodeEnv === 'production' && !local && input.environment === 'production'
      ? 'production'
      : 'development'
  const production = environment === 'production'
  const dsn = production ? input.productionDsn : input.developmentDsn
  // 개발 DSN 허용 조건: 브라우저면 dev.pawpong.kr 에서만, 서버면 Vercel 배포에서만.
  // NEXT_PUBLIC_SENTRY_ENABLE_DEV 가 켜져 있어도 localhost 는 여기서 걸러진다.
  const devHostAllowed =
    input.hostname !== undefined
      ? DEV_REPORT_HOSTS.includes(input.hostname)
      : input.onVercel === true
  const enabled = Boolean(
    dsn &&
      (production ||
        (input.enableDevelopment === 'true' && dsn !== input.productionDsn && devHostAllowed)),
  )
  return { environment, dsn: enabled ? dsn : undefined, enabled }
}

export function sentryEnvironmentOptions() {
  return {
    ...resolveSentryEnvironment({
      environment: process.env.NEXT_PUBLIC_APP_ENV,
      nodeEnv: process.env.NODE_ENV,
      hostname: typeof window === 'undefined' ? undefined : window.location.hostname,
      productionDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      developmentDsn: process.env.NEXT_PUBLIC_SENTRY_DEV_DSN,
      enableDevelopment: process.env.NEXT_PUBLIC_SENTRY_ENABLE_DEV,
      onVercel: process.env.VERCEL === '1',
    }),
    beforeSend: createErrorBudget(),
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    enableLogs: false,
    sendDefaultPii: false,
  }
}

/** 같은 실행 환경의 오류 폭주를 제한함. 전역 월간 한도를 대체하지는 않음. */
export function createErrorBudget(now = () => Date.now()) {
  let windowStart = now()
  let sent = 0
  const recent = new Map<string, number>()
  return <
    T extends { message?: string; exception?: { values?: { type?: string; value?: string }[] } },
  >(
    event: T,
  ): T | null => {
    const time = now()
    if (time - windowStart >= 60_000) {
      windowStart = time
      sent = 0
      recent.clear()
    }
    const key = JSON.stringify(
      event.exception?.values?.map(({ type, value }) => [type, value]) ||
        event.message ||
        'unknown',
    )
    if (sent >= 20 || recent.has(key)) return null
    recent.set(key, time)
    sent += 1
    return event
  }
}
