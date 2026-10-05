# 운영 Sentry 요청 오류 진단 복구 (2026-10-05)

## 확인한 운영 오류

운영 조직 `pawpong-mq`, 프로젝트 `pawpong-web-production`의 `environment=production`, 최근 14일 미해결 이슈 8건을 실제 Sentry 세션에서 조회했다. 사용자·인증·요청 본문은 작업 기록에 복사하지 않았다.

- `PAWPONG-WEB-PRODUCTION-D`: 2026-10-05 11:31:05 UTC, `/signup/general/profile`, iOS 18.7 WKWebView. 30초 POST 타임아웃이다. Sentry의 실패한 주소는 `[Filtered]`이고 원본 소스도 `js_no_source`로 찾지 못했다. 사진 업로드인지 인증번호 요청인지 확정할 근거는 없다.
- `PAWPONG-WEB-PRODUCTION-4`: 최신 운영 이벤트 2026-10-03 15:27:31 UTC, `/explore`, `POST /api/v2/adopter/favorite`의 연결 실패.
- `PAWPONG-WEB-PRODUCTION-C`: 2026-10-03 11:17:53 UTC, `GET /api/v2/community/hall-of-fame/current`의 30초 타임아웃.
- 나머지 5건: 2026-10-03의 지도 config/places 503 오류. 현재 운영 화면과 실제 API를 다시 확인했다.

## 실제 서버·브라우저 확인

- Orca 내장 브라우저에서 운영 `/care-map` 시설 목록과 지도 표시 확인.
- 운영 지도 config, 좌표·반경을 포함한 hospital places, 명예의 전당 current API는 모두 200/success로 응답했다.
- 현재 운영 API 호스트의 nginx 및 `pawpong_green` 로그를 읽었다. 11:25–11:35 UTC 앱 로그 252줄에 warn/error가 없었으며, 문제 시각의 완료된 가입 POST 요청을 찾지 못했다. 11:34:46 UTC의 인증번호 발송은 200/1835ms였다. 완료 로그의 부재만으로 네트워크 타임아웃의 원인을 확정하지 않는다.
- 운영 Vercel 배포의 Git 원본은 `main@4a787e19ca31cd40530e438138b56a14035c14d6`이다. 운영 환경에 소스맵 업로드용 `SENTRY_AUTH_TOKEN`이 없었다. 기존 Sentry 프로젝트의 `org:ci` 범위 토큰을 만들어 production의 sensitive 환경 변수로만 설정했다. 토큰 값은 코드·로그·PR에 남기지 않는다. 새 운영 빌드에서 실제 업로드 성공을 별도로 확인한다.

## 수정 내용

- Axios가 정규화한 ApiError에 HTTP 메서드, API 계약에 정의된 정적 경로 템플릿, 전송 오류 코드만 보관한다. 영문 닉네임을 포함한 모든 동적 위치는 `:id`, 미등록 경로는 `/unknown`으로 기록한다. Axios config나 인증 헤더, 요청 본문, 쿼리는 붙이지 않는다. Codex 리뷰의 P1 개인정보 지적을 수정했다.
- QueryCache/MutationCache의 Sentry 전송에 이 안전한 요청 context와 경로별 fingerprint를 연결한다. SDK 중복 제거와 분당 오류 예산 모두 서로 다른 API 장애를 보존한다. 같은 요청의 반복 제한과 분당 20건 상한은 유지한다.
- 타임아웃·연결 실패의 사용자 메시지를 한국어 재시도 안내로 바꾼다. 변경 작업의 모호한 POST 타임아웃은 자동 재전송하지 않는다. 인증 refresh 처리와 즐겨찾기 동작을 유지한다.
- 기존 미해결 이슈를 일괄 숨기거나 해결 처리하지 않는다. 이번 변경은 진단 공백과 오류 안내를 고친다. 과거 연결 오류의 발생 원인이 모두 해결됐다는 의미는 아니다.

## 검증

- 실제 설치된 Axios와 로컬 HTTP 서버로 multipart 파일 내용·401 refresh·멈춘 POST 타임아웃·민감 정보 제외·중복 POST 방지를 확인했다.
- 실제 설치된 TanStack Query의 query/mutation 실패에서 Sentry context 전달과 400 오류 제외를 확인했다. 실제 Sentry SDK의 중복 제거에서도 서로 다른 API 오류가 보존되는지 확인했다.
- API·세션 복구·즐겨찾기·Sentry 환경 및 오류 예산 회귀 테스트 28건 통과. 이는 격리된 자동 테스트이며 실제 심사 계정 로그인 검증으로 보고하지 않는다.
- 변경 소스 ESLint, TypeScript 타입 검사 및 최종 Next.js 운영 빌드 통과. 선별 운영 브랜치에서는 동일 진단·세션 테스트 16건을 별도로 검증한다.

## 반영 범위

하트의 브라운 외곽 변경은 별도 커밋으로 dev에 반영한다. 선택 후 빨간색, 모양, 호버 없음, 클릭 처리 및 깜빡임 방지 로직은 유지한다. 운영에는 본 문서의 Sentry 요청 진단·오류 안내 변경만 선별 반영한다. dev 전체나 다른 기능을 운영으로 승격하지 않는다. 반려동물 키우기 품질·공개 토글과 인앱결제 잠금은 계속 OFF다.
