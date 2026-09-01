import type { components } from './api.generated'

/**
 * 백엔드 응답/요청 DTO의 단일 출처.
 *
 * `api.generated.ts` 는 백엔드 OpenAPI(`/docs-json`)에서 생성되므로,
 * 화면 타입을 손으로 베끼는 대신 여기서 끌어다 쓰면 계약이 어긋나는 순간 tsc 가 잡는다.
 * (손으로 베끼던 시절 실제로 min↔minPrice, verificationStatus↔status,
 *  followingCount 옵셔널 같은 불일치가 화면까지 흘러갔다)
 *
 * 갱신: 백엔드를 띄운 상태에서 `pnpm api:update`
 *
 * 사용 예)
 *   import type { ApiSchemas } from '@/shared/types'
 *   type MyProfile = ApiSchemas['MyProfileResponseDto']
 */
export type ApiSchemas = components['schemas']

/** 생성 타입 원본이 필요할 때 (paths/operations 기반 유틸을 짤 때만) */
export type { components as ApiComponents, paths as ApiPaths } from './api.generated'
