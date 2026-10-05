# 포퐁 앱 검색 및 웹 연결

## 범위

- 한국을 주요 시장으로 유지하며 웹 및 스토어 기본 언어는 한국어다.
- 출시된 iOS 앱 `6814126823` / `kr.pawpong.app`, Android 앱 `kr.pawpong.app`을 웹의 공개 정보와 연결한다.
- `/app`은 로그인 없이 SSR되는 앱 소개 및 공식 다운로드 페이지다. 사이트 푸터와 sitemap에서 발견할 수 있어야 한다.
- 공개 canonical을 가진 페이지에 Smart App Banner 및 두 플랫폼의 App Links 메타데이터를 제공한다. 로그인, 비공개 화면, 존재하지 않는 공유 링크에는 앱 경로를 추가하지 않는다. 루트 layout에서 자식 화면에 잘못된 경로가 상속되지 않아야 한다.
- 관리형 공유 링크의 버전 설정이 비거나 실패해도 이미 출시된 공식 다운로드 링크를 제공한다. 관리자가 지정한 URL 역시 실제 포퐁 앱 ID를 검증한다.
- 구조화 데이터에는 실제 무료 앱 정보와 공개 기능만 사용한다. 검증되지 않은 평점, 리뷰, 버전 또는 미출시 게임을 기재하지 않는다. 검색 순위나 리치 결과 노출을 보장하지 않는다.

## 출시 및 검증

- dev에서 테스트, 타입, lint, build와 실제 SSR HTML을 확인한 뒤 병합한다. 운영 적용은 별도 사용자 지시가 필요하며 dev 전체를 main으로 승격하지 않는다.
- 기본 언어를 유지하는 스토어 국가 확대는 사용자의 별도 글로벌 배포 지시에 따른 설정 작업이다. 앱 설치 가능 여부와 해외 번호 회원가입 지원 여부를 구분한다.
- 실제 스토어 ID, RN 식별자, 운영 association 파일 응답을 확인한다. HTTP 응답만으로 실기기의 Universal/App Links 성공을 단정하지 않는다.
- 390/768/1440 CSS 폭에서 다운로드 버튼 48px, 가로 넘침 없음, 공개 페이지의 로그인 비의존성을 확인한다. 입력/미디어 에뮬레이션의 적용 실패는 통과로 기록하지 않는다.
- 인앱결제 및 게임 공개 잠금은 그대로 유지한다.

## 확인한 별도 운영 조건 (2026-10-06)

- 운영 Android 버전 설정의 `storeUrl`이 비어 있어 기존 공유 링크에서 다운로드 버튼이 빠질 수 있었다. 공식 앱 링크 fallback으로 해결한다. 강제 업데이트 기준은 수정하지 않는다.
- apex association 파일은 200 JSON이며 www 파일은 apex로 308 redirect된다. RN은 두 호스트를 선언한다. OS/실기기별 연결 검증 및 www 호스트 설정은 별도로 확인해야 한다.
- iOS는 모든 175개 스토어를 선택해 국가 확대를 저장했다. 당시 한국 1개 사용 가능, 145개 반영 처리 중, EU 27개 거래자 확인 미제공, 2개 판매 불가였다. 전체 선택 저장을 전 세계 공개 완료로 표현하지 않는다.
- Android는 기존 한국 배포에 176개 국가 및 기타 국가 추가를 검토 제출했다. 관리형 게시가 켜져 있어 검토 승인 후 국가 변경만 별도 게시되어야 한다.

## 참고

- https://developer.apple.com/documentation/webkit/promoting-apps-with-smart-app-banners
- https://developer.android.com/training/app-links/verify-applinks
- https://developers.google.com/search/docs/appearance/structured-data/software-app
