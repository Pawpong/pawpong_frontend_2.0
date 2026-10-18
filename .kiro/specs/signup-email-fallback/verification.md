# 검증 기록 (2026-10-07)

- 작업 대상: `kscold/signup-email-fallback` → `dev`. origin/dev `ad01f20c`까지 안전하게 통합했다. main/운영/IAP/게임 코드는 변경하지 않았다.
- 전체 Node tests 438 통과 (신규 이메일 계약/스키마/매퍼/저장소 8 tests 포함), 타입 검사와 빌드 통과. ESLint0 errors, 기존 공통 파일2 warnings.
- Orca 내장 브라우저에서 문자 API 반복 실패 후 이메일 전환, 두 번 클릭 시 발송1건, 잘못된 코드 안내, 인증 성공, 코드 원문 삭제, 새로고침 후 proof 복원, 약관 동의 후 가입과 완료 화면을 확인했다.
- 화면/API/DB 가입 흐름은 실제 NestJS HTTP와 격리 Mongo를 사용했다. SMTP/소셜 세션만 QA fixture이므로 실제 dev 메일 전달이나 심사 계정 가입 검증으로 보고하지 않는다.
- CSS viewport 390/768/1440을 실제 `innerWidth`로 확인했다. 가로 넘침 없음, 신규 인증 입력/행동 버튼은 높이48px. 입력에 email/one-time-code 자동완성, 상태 안내에 aria-live, 인증 입력에 Enter 처리.
- Codex 리뷰의 유효시간 종료 후 주소가 잠기는 문제를 수정했다. 짧은 만료시간의 UI fixture로 안내 표시·주소 편집·tabIndex 복구·저장 proof 폐기를 확인했다.
- 서버가 비지원/404/실패 응답이면 이메일 성공 상태를 만들지 않는다. 지원 조회 실패 시 다시 확인할 수 있다. 실제 서버 proof가 없거나 만료되면 일반/브리더 가입을 진행하지 않는다.
- 실제 SMTP 인증 및 소유자 수신 확인은 서버 검증 기록과 별도로 보고한다. 최종 PR/SHA/실행 URL/화면 증거는 워크스페이스 밖의 작업 결과물에 보존한다.
