# 웹·Android GA/GTM 연결

## 확인된 원인과 연결 대상

- 기존 운영 웹에 GA/GTM 스크립트가 없었고 RN에도 Firebase Analytics SDK가 없었음.
- 사용자 지정 웹 GA: account `378209392`, property `517034952`, stream `13167633493`, measurement `G-0HJT8CJFGN`.
- 웹 GTM: account `6380363240`, container `265988640`, public ID `GTM-52KZQGJJ`, published version `2`.
- Firebase `pawpong-prod`는 기존 GA property `534551991`와 Android stream `14589090319`에 연결됨.
- Firebase를 웹 property로 통합하려는 UI에서 현재 계정의 연결 권한 부족을 확인함. 기존 Firebase property `534551991` 연결을 복구했으며 앱·스트림·기존 데이터는 삭제하지 않음. 통합하려면 GA 계정 소유자의 연결 권한 부여가 필요함.

## 수집 계약

- 운영 호스트 `pawpong.kr`/`www.pawpong.kr`와 production 환경에서만 웹 수집함. 개발·preview는 기본 비활성임.
- 로컬 검증만 `NEXT_PUBLIC_ANALYTICS_DEBUG=true`로 허용함. 운영 환경변수로 등록하지 않음.
- GTM Google tag의 자동 page_view는 꺼져 있음. `pawpong_page_view`에서만 GA4 `page_view`를 전송함.
- GA 웹 스트림의 향상된 측정에서 history/scroll/outbound/search/form/video/download 자동 측정을 비활성화함. SPA 이동의 수집 책임은 웹 코드 한 곳에 둠.
- 경로 내 사용자·게시물·신청 식별자를 템플릿으로 치환함. URL query/hash, 동적 문서 제목, 검색어, 채팅 본문, 이메일, 닉네임, 인증값은 전송하지 않음.
- 구버전 Android 앱은 `android_webview`로 웹 스트림에 기록함. 새 Android 앱이 `analytics` capability를 제공하면 웹 GTM을 로드하지 않고 고정 screen 이름만 네이티브로 전달함.
- 광고 개인화·Google signals를 비활성화함. 사용자 ID를 연결하지 않음.
- 구매/구독 이벤트나 결제 UI 활성화는 이 작업에 포함하지 않음.

## 검증

- 타입 검사·변경 파일 ESLint·프로덕션 빌드 통과함.
- 프론트 전체 테스트 219개 통과함. 개인정보 제외/환경 제한/SPA 중복/Android 전송 분리 5개 회귀 포함함.
- Orca 로컬 프로덕션 빌드 `3024`에서 community→explore로 이동함. GTM 스크립트 1개와 페이지당 이벤트 1회를 확인함.
- 실제 Google `/g/collect` 요청 모두 HTTP 204이며 `dl`/`dr`/`dt`가 지정한 안전한 값인지 확인함.
- 지정 GA property `517034952` 실시간에서 활성 사용자 1명, `community` 1회·`explore` 1회, `page_view` 2회·`session_start` 1회를 확인함(2026-10-03 21:05 KST).

## 운영 유지

- `web-container.json`은 복구 가능한 GTM 구성임. 공개 컨테이너/측정 ID만 포함하고 인증키는 없음.
- 자동 history page_view와 별도 gtag.js를 추가하면 중복 집계됨. 태그를 추가할 때 사용자 입력값을 변수로 등록하지 않음.
- Android SDK 추가는 새 네이티브 바이너리 배포가 필요함. 웹 배포만으로 기존 APK의 Firebase SDK가 추가되지는 않음.
- 문서 근거: https://firebase.google.com/docs/analytics/webview, https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications, https://developers.google.com/tag-platform/tag-manager/android/v5

## Independent review follow-up

- A separate Codex reviewer inspected a28a8731 / dev PR #370, verified the existing GA realtime observations without generating extra traffic, and reported one P2: a 250 ms WebView visit followed by Back lost both the intermediate and return views.
- Capability detection now waits only for the first transport selection. Subsequent committed routes are sent immediately. A regression covers community → explore (250 ms) → community for both native Android and the older WebView fallback.
- After integrating origin/dev 0046fa8b, `node --test tests/*.test.cjs` passed 227 tests, TypeScript and the production build passed. The changed component passed ESLint; test CJS files are excluded by the repository ESLint configuration.
- CodeRabbit reported SUCCESS but explicitly skipped automatic review for the OSS repository. The independent review above is the actual review evidence.
