/**
 * 백엔드 OpenAPI 문서를 swagger.json 으로 내려받는다.
 *
 * 이 파일은 손으로 고치지 않는다 — 프론트 타입(src/shared/types/api.generated.ts)의 원본이며,
 * 손으로 베껴 쓰던 시절에 min/minPrice · verificationStatus/status · followingCount 옵셔널 같은
 * 계약 불일치가 반복해서 새어 들어왔다.
 *
 * 사용:
 *   pnpm api:update                      # 동기화 + 타입 생성
 *   API_DOCS_URL=... pnpm api:sync       # dev/운영 서버에서 받기
 *
 * 백엔드가 떠 있어야 한다 (pawpong_backend 에서 pnpm start:dev).
 */
import { writeFileSync } from 'node:fs'

const url = process.env.API_DOCS_URL ?? 'http://localhost:8080/docs-json'
const out = new URL('../swagger.json', import.meta.url)

const res = await fetch(url).catch((error) => {
  console.error(`[api:sync] ${url} 요청 실패 — 백엔드가 떠 있는지 확인하세요.`)
  console.error(`           ${error.message}`)
  process.exit(1)
})

if (!res.ok) {
  console.error(`[api:sync] ${url} → HTTP ${res.status}`)
  process.exit(1)
}

const doc = await res.json()
const operationCount = Object.values(doc.paths ?? {}).reduce(
  (sum, methods) => sum + Object.keys(methods).length,
  0,
)

// 압축된 한 줄로 저장하면 변경 한 건에도 전체 파일 diff 가 나서 리뷰가 불가능해진다
writeFileSync(out, `${JSON.stringify(doc, null, 2)}\n`)

console.log(`[api:sync] ${url}`)
console.log(
  `           오퍼레이션 ${operationCount}개 · 스키마 ${Object.keys(doc.components?.schemas ?? {}).length}개 → swagger.json`,
)
