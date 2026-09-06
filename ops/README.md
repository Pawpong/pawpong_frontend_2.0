# 배포 및 오류 알림

- Vercel 프로젝트: `pawpong-frontend-2-0` / `pawpongs-projects`.
- 운영 도메인 `pawpong.kr`은 Production 환경의 `main` 브랜치를 추적함.
- 개발 도메인 `dev.pawpong.kr`은 Preview 환경의 `dev` 브랜치를 추적함.
- Preview API 주소는 `https://dev-api.pawpong.kr`임. API 경로(`/api/v2`)는 클라이언트에서 붙임.
- 운영 Sentry 프로젝트는 `pawpong-mq/pawpong-web-production`, 개발은 `pawpong-mq/pawpong-web-development`임.
- Production에만 `NEXT_PUBLIC_SENTRY_DSN`, Preview의 dev 브랜치에 `NEXT_PUBLIC_SENTRY_DEV_DSN`과 `NEXT_PUBLIC_SENTRY_ENABLE_DEV=true`를 설정함.
- localhost와 Preview는 운영 DSN을 사용하지 않음. 비운영 이벤트의 Sentry environment는 development로 통일함.
- 오류만 수집함. 성능 추적·리플레이·로그 수집을 끄고 동일 실행 환경에서 같은 오류는 1분에 한 번, 전체 오류는 분당 20건까지 전송함. 이 제한은 조직 전체 월간 한도를 보장하지 않음.
- 무료 플랜용 Discord 중계는 백엔드 저장소 `ops/observability/sentry-monitor.py`에서 5분 주기로 수행함.
- `deployment_status`를 통해 Vercel의 성공/실패와 별도의 공개 HTTP 헬스체크 결과를 Discord에 전달함. 보호된 Preview는 헬스체크 미확인으로 표시함.
- Git 작성자는 Vercel 팀에 연결된 Git 계정과 일치해야 함. 권한 문제는 계정 연결로 해결하고 다른 사람의 작성자 정보를 사용하지 않음.

## 브랜치 흐름

- 기능 작업은 `dev`에서 `feature/*`를 만들어 진행하고 검증 후 `dev`로 합침.
- `dev.pawpong.kr`에서 통합 검증한 변경을 `main`으로 승격해 `pawpong.kr`에 배포함.
- 기존 `test` 작업 이력은 `dev`에 병합함. 이후 새 작업의 기준 브랜치는 `dev`이며 `test`는 삭제하지 않고 이력 보관용으로 둠.

## Discord 채널과 배포 카드

- 프론트/관리자 배포는 `프론트엔드-배포`, 백엔드/Agent 배포는 `백엔드-배포`로 전달함. 각 저장소의 운영·개발 배포 secret 모두 해당 서비스 배포 웹훅을 사용함.
- 오류 채널은 `프론트엔드-운영-오류`, `프론트엔드-개발-오류`, `백엔드-운영-오류`, `백엔드-개발-오류`로 구분함. 오류 웹훅을 배포 secret에 넣지 않음.
- 카드에 서비스·환경·브랜치·배포 방식·대상 서버·실행자·커밋 작성자·SHA·메시지·주소·헬스체크·로그 링크를 표시함. Vercel 실행 봇과 실제 커밋 작성자를 구분함.
- GitHub 커밋 API를 읽기 토큰으로 조회함. 브랜치를 특정할 수 없는 SHA 배포는 확인 불가로 표시하며 추측하지 않음. 커밋 원문을 셸에서 실행하지 않고 Discord 멘션을 차단함.
- 기존 채널의 과거 메시지는 보존함. 새 라우팅은 이후 알림부터 적용됨.
