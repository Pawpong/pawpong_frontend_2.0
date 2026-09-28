# dev → main 운영 반영 (2026-09-28)

- dev의 AI 필터·사진 보관·게시물 사진 선택, 커뮤니티 좋아요 명예의 전당, 대표 사진 4장 및 탐색을 main에 통합한다.
- 기존 main 개인정보/계정 삭제/작성자별 재동의/네이티브 앱 공개 제한은 유지한다.
- 동의 저장이 accepted=true인지 확인한 뒤 화면을 갱신하며, React Query 목록 캐시를 무효화해 동의 전에 빈 목록이 계속 남지 않도록 한다.
- 동의 안내는 iOS 한정 표현 대신 포퐁 앱으로 변경한다.

## 검증

- pnpm type-check 통과.
- pnpm exec next build --webpack 통과. 로컬 node_modules 공유 symlink는 Turbopack 루트 범위를 넘으므로 로컬 검증에 webpack을 사용했다. 원격 배포는 자체 의존성을 설치한다.
- 변경된 동의/AI/Hall of Fame 컴포넌트 ESLint 통과.
- 백엔드 새 API를 먼저 배포한 뒤 프론트를 main에 반영한다.


## 앱 연결·문의 보완
- dev.pawpong.kr만 Vercel alias-protection-override로 공개. 프로젝트 전체 보호는 유지. 쿠키 없는 HEAD 302→200 확인; 다른 preview 예외는 추가하지 않음.
- 운영 main d2429b2e Vercel READY.
- FAQ 답변의 긴 링크 줄바꿈, 각 항목에서 AI 문의 열기. AI 안내 전에 서버에 문의 접수; 실패 시 원문·접수번호 유지. 개별 회신 경로는 기존 담당자 이메일.
- 앱 WebView에서만 viewport 배율 제한 및 iOS pinch/multitouch 기본 동작 차단. 일반 브라우저는 그대로. React 이벤트와 MutationObserver 모두 정리.
