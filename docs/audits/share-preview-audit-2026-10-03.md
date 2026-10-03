# 링크 공유 미리보기 전수 점검

점검일: 2026-10-03. 소스 page.tsx 46개(직접 경로 45개 + 인터셉트 모달 1개), 모든 상위 layout, 공유 전용 Route Handler와 공유 모달 확인. 운영 정적 페이지 32개와 /l/ai-filter, robots.txt, sitemap.xml HTTP 확인. 로그인 없이 facebookexternalhit/1.1 UA 사용, 리다이렉트 추적. 동적 ID별 실제 콘텐츠와 모든 관리형 slug는 미검증.

## 결론

- 전체 적용 아님. 일반 페이지의 Open Graph 설정은 0개이며 루트에도 기본 OG가 없음.
- 페이지 자체 metadata 선언은 8/46개. 그 외 38개는 루트 Pawpong 제목/설명을 상속(리다이렉트 및 인터셉트 포함).
- /l/ai-filter 운영 HTML에는 제목, 설명, OG 이미지, canonical, twitter:card가 있음. 공유 로고 PNG는 600×315.
- /ai-filter 직접 주소는 제목/설명만 있고 OG 이미지가 없음. 공유 전용 링크와 직접 링크의 미리보기 처리가 다름.
- 분양/게시글/공개 프로필/공지 상세는 generateMetadata가 없어 콘텐츠별 미리보기 없음.
- 분양 상세 카카오 SDK 공유는 이름/설명/사진을 따로 전달하지만 URL 복사·붙여넣기 및 URL 기반 공유의 OG를 보완하지 못함.
- 비공개/작업 페이지의 noindex 정책은 전반적으로 없음. 심사용 로그인에는 있음. 인증 보호 여부와 검색 제외 정책은 별개이며 개인정보 노출로 단정하지 않음.
- robots.txt와 sitemap.xml은 운영에서 404. 공유 카드 자체의 필수 조건은 아니나 검색 노출 관리가 미완성.

## 페이지별 목록

| 경로 | 소스 metadata | 운영 응답 메타 또는 확인 범위 |
|---|---|---|
| `/about` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/account/content-rights` | 있음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/account/delete` | 있음 | HTTP 200 · title: 계정 영구삭제 | 포퐁 · OG 없음 |
| `/activity/applications/[applicationId]/edit` | 없음 | 동적 경로: 소스 확인, 개별 ID 운영 미검증 |
| `/activity/applications/[applicationId]` | 없음 | 동적 경로: 소스 확인, 개별 ID 운영 미검증 |
| `/activity` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/activity/received-reviews/[reviewId]` | 없음 | 동적 경로: 소스 확인, 개별 ID 운영 미검증 |
| `/activity/reviews/[reviewId]` | 없음 | 동적 경로: 소스 확인, 개별 ID 운영 미검증 |
| `/adoption/[id]/apply` | 없음 | 동적 경로: 소스 확인, 개별 ID 운영 미검증 |
| `/adoption/[id]/edit` | 없음 | 동적 경로: 소스 확인, 개별 ID 운영 미검증 |
| `/adoption/[id]` | 없음 | 동적 경로: 소스 확인, 개별 ID 운영 미검증 |
| `/adoption/application-form` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/adoption/create` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/adoption/create/success` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/ai-filter` | 있음 | HTTP 200 · title: AI 필터 · OG 없음 |
| `/bookmarks` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/care-map` | 있음 | HTTP 200 · title: 우리 동네 돌봄 지도 | 포퐁 · OG 없음 |
| `/chat` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/community/@modal/[postId]` | 없음 | 인터셉트 모달: 직접 상세 경로에서 공유 |
| `/community` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/community/post/[postId]/edit` | 없음 | 동적 경로: 소스 확인, 개별 ID 운영 미검증 |
| `/community/post/[postId]` | 없음 | 동적 경로: 소스 확인, 개별 ID 운영 미검증 |
| `/community/write` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/drafts` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/explore` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/faq` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/hall-of-fame` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/hall-of-fame/participate` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/home/[userId]` | 없음 | 동적 경로: 소스 확인, 개별 ID 운영 미검증 |
| `/home` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/notices/[noticeId]` | 없음 | 동적 경로: 소스 확인, 개별 ID 운영 미검증 |
| `/notices` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/notifications` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/playground` | 있음 | HTTP 200 · title: 놀이터 · OG 없음 |
| `/profile/edit` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/profile/verification` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/settings` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/terms-of-privacy` | 있음 | HTTP 200 · title: 개인정보처리방침 | Pawpong · OG 없음 |
| `/terms-of-service` | 있음 | HTTP 200 · title: 이용약관 | Pawpong · OG 없음 |
| `/login` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/login/review` | 있음 | HTTP 200 · title: 심사용 계정 로그인 | 포퐁 · OG 없음 · noindex |
| `/login/success` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |
| `/signup/[type]/[step]` | 없음 | 동적 경로: 소스 확인, 개별 ID 운영 미검증 |
| `/signup/[type]` | 없음 | 동적 경로: 소스 확인, 개별 ID 운영 미검증 |
| `/signup` | 없음 | HTTP 200 · title: Pawpong · OG 없음 |

## 근거 파일

- `src/app/layout.tsx:11`: 루트 제목/설명 Pawpong, metadataBase/openGraph/twitter 없음.
- `src/app/l/[slug]/_lib/landing.ts:144`: 관리형 링크의 OG 생성.
- `src/app/l/[slug]/route.ts`: 백엔드 slug 조회 후 서버 HTML 응답, 미등록 404/실패 503.
- `src/app/(main)/adoption/[id]/_ui/AdoptionDetailRail.tsx:160`: SDK 공유용 데이터 전달.
- `src/shared/ui/ShareModal.tsx:134`: 기본 공유 URL은 현재 URL, 관리형 링크 자동 변환 없음.

## 권장 수정 순서

1. 루트 기본 브랜드 OG 이미지·제목·설명·절대 기준 URL 설정.
2. 공개 정적 페이지별 제목/설명/공유 URL 설정.
3. 공개 분양·게시글·프로필·공지 상세에 서버 기반 콘텐츠별 메타 생성과 삭제/비공개 fallback 설정.
4. 개인·작성·인증 화면 검색 제외 정책과 sitemap/robots 정리.
5. 배포 후 카카오 실제 미리보기 및 캐시 갱신 검증. 현재는 HTTP 메타 확인만 했으며 메시지 발송은 하지 않음.

이 보고서는 조사 결과이며 서비스 코드는 수정하지 않음.
