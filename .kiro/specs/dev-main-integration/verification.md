# dev → main 통합 검증 (2026-09-24)

## 반영 순서

- 프론트와 백엔드는 `dev`에서 변경을 통합하고 검증·커밋·푸시한 다음 `main`으로 반영한다.
- `main`에 먼저 들어간 변경은 `dev`로 병합해 양쪽 기능을 검증한다. 한쪽 파일 전체를 선택해 다른 쪽 동작을 버리지 않는다.
- 검증한 `dev`가 원격 `main`을 포함하면 fast-forward로 같은 커밋을 반영한다. 동시 원격 변경이 있으면 다시 통합한다.
- 커밋은 한국어 제목과 `- …함` 형식의 한 줄 본문을 사용하고 공동 작성자 trailer를 추가하지 않는다.

## 프론트 통합 범위

- `f292788`: main의 심사 로그인·영구삭제 요청/상태 조회와 dev의 세션 복구·카메라/공유 브리지를 통합함.
- `c080ba5`: 원격 dev의 보안 의존성 업데이트 `9e6dae2`를 유지함.
- 탈퇴·로그아웃 진행 중 앱 복귀가 보호된 요청보다 먼저 쿠키를 지우지 않도록 요청 진행 상태를 구분함. 오프라인 정리가 실패하면 같은 문서와 재시작 후에도 정리를 재시도함.
- 실패·취소된 심사 로그인이 기존 로그아웃 의도를 해제하지 않도록 인증 성공 시점에만 새 세션을 열도록 수정함.
- 숨김 상태에서 탈퇴가 실패해도 화면 복귀 시 동일 계정의 네이티브 푸시를 다시 연결함.
- Next 서버 바인딩 주소와 브라우저 주소가 다른 로컬/RN 환경에서 BFF가 정상 요청을 403으로 거절하는 문제를 수정함. 요청 Host와 프로토콜을 정확히 비교하며 임의의 전달 Host로 덮어쓰지 않음.

## 검증

- `node --test tests/*.test.cjs tests/*.test.mjs`: 123개 통과.
- TypeScript 검사, 변경 TypeScript/TSX ESLint, Next.js 16.3.6 프로덕션 빌드 통과.
- `pnpm audit --prod`: 취약점 0건.
- 실제 lifecycle/recovery/bridge 모듈을 결합해 탈퇴 중 앱 복귀, 실패 후 세션 유지, 접수 응답 유실과 오프라인 정리를 검증함.
- Orca 격리 브라우저에서 `/login/review` HTTP 200과 폼 렌더링 확인함.
- 실행 중인 FE 3000에서 인증 없는 `/api/account-deletion/prepare` 요청은 localhost·Android Host 모두 401, 외부 출처·null 출처는 403임.
- 원본 RN Metro 8081의 `/status`는 `packager-status:running`임. 이번 통합에서 RN 코드와 서명 산출물은 변경하지 않음.

## 출처 검사 근거

설치된 Next.js `next-server.js`는 서버 hostname/port로 내부 요청 URL을 만들 수 있음. 실제 요청의 대상 Host와 Origin을 비교하는 정책은 [OWASP CSRF 가이드](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#identifying-the-target-origin)를 참고함. 프록시 배포에서는 신뢰할 수 있는 인프라가 실제 공개 Host를 보존해야 함.
