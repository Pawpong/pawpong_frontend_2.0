# 모바일 연동 웹 검증 — 2026-09-24

## 구현

- `/l/[slug]`가 공개 딥링크 API를 조회해 완성된 HTML과 OG 메타데이터를 반환함. JavaScript 없이 앱 열기·웹 이동·다운로드 링크 사용 가능함.
- iOS `pawpong://l/{slug}`, Android `intent://l/{slug}` 및 앱 미설치 fallback 제공함. 다운로드 주소는 플랫폼별 앱 버전 API에서 가져오며 HTTPS 공식 스토어 주소만 표시함.
- 관리자 비활성화가 즉시 반영되도록 HTML/API fetch 캐시를 끔. 누락·비활성 링크 404, API 장애·비정상 응답 503으로 구분함.
- 백엔드와 같은 앱 목적지 허용 목록, HTML escape, CSP, 공식/dev/local 원본 검증 적용함.
- SVG 워드마크를 공유용 PNG로 변환함.
- 웹 루트가 기존 로그인·가입·쿠키 갱신·앱 재실행 시 RN에 푸시 계정 연결을 요청함. 로그아웃은 네이티브 해제 ACK를 제한 시간 동안 기다린 뒤 서버 세션을 정리함.
- 로그아웃 도중 늦은 refresh와 이미 진행 중인 Set-Cookie 응답이 세션을 복원하거나 푸시를 재등록하지 않도록 세대 검증과 쿠키 쓰기 대기를 적용함.

## 검증 결과

- `node --test tests/*.test.cjs tests/*.test.mjs`: 55개 통과. 새 딥링크·네이티브 세션 회귀 12개 포함함.
- `pnpm type-check`, 변경 파일 ESLint, `pnpm build` 통과함.
- Orca 관리 터미널의 격리 Nest+Mongo API(8086)와 Next 웹(3017)을 연결해 관리자 API로 신규 링크 생성 → 최초 HTML의 제목/OG/앱 버튼/웹 목적지 확인 → 비활성화 즉시 404 → 재활성화 및 제목 수정 즉시 200 반영을 확인함. 검증용 링크는 삭제함.
- Android User-Agent 요청의 intent package/fallback, iOS/공유 크롤러 요청의 custom scheme, JavaScript 없는 응답을 확인함.
- Orca 내장 브라우저에서 seed 공유 링크 화면과 `웹에서 계속하기` 클릭 후 `/explore` 실제 렌더링을 확인함. [공유 링크 화면](evidence/web-managed-link.png)
- 별도 worker가 로그아웃 중 refresh 토큰 교체 상황을 재현해 기존 재등록 결함과 수정 후 재등록 차단을 교차 확인함.
- 기존 Sentry 테스트의 개발 호스트 입력을 현재 dev 도메인 허용 정책에 맞추고 localhost 차단도 검증함. 수집 정책 코드는 변경하지 않음.

## 검증 범위

- 이 문서의 HTML/브라우저 테스트는 실제 격리 API와 DB를 사용함. 해당 런타임은 실제 FCM 전송을 차단하므로 푸시 기기 수신 증거를 뜻하지 않음.
- 테스트 DB의 App Store 주소는 임시 값임. 버튼 생성과 전달 계약만 확인했으며 실제 스토어 공개·설치 성공은 별도 확인 대상임.
- 실제 iOS/Android 알림 수신·앱 링크·업데이트 안내 검증은 RN 저장소 `.kiro/specs/mobile-integration/rn-verification.md`에 기록함.

## 로컬 병렬 검증

기존 웹 개발 서버와 함께 실행할 때 `PAWPONG_NEXT_DIST_DIR=.next-mobile-integration NEXT_PUBLIC_API_BASE_URL=http://localhost:8086 pnpm dev --hostname 0.0.0.0 --port 3017` 사용함. Next가 자동 추가하는 임시 dist 경로의 tsconfig 변경은 커밋하지 않음.
