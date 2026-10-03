# 내 반려동물 키우기 프론트 v1 — dev 전용

근거: Obsidian `Projects/Pawpong/놀이터_도트친구_다마고치_기획_v1.md` 및 백엔드 `.kiro/specs/playground-pet/contract.md`와 실제 DTO(2026-10-03).

사용자 후속 지시(2026-10-03): 공개 이름은 **내 반려동물 키우기**로 통일한다. 강아지·고양이 등 기존 대상을 보존하고, 도트는 그림 스타일을 설명할 때만 쓴다. 온보딩은 **완성된 그림 고르기 → 이름 지어 주기 → 매일 돌보기** 순서다. 코드/API 식별자와 게임 정책은 바꾸지 않는다.

## 경계와 진입

- `/playground` 카드, AI 생성 결과/보관함의 서버 자격 확인 CTA, `/playground/pet`을 제공한다.
- 서버 환경 `APP_ENV=development`, `PLAYGROUND_PET_ENABLED=true`를 모두 요구한다. 기존 `NEXT_PUBLIC_API_BASE_URL`은 개발 API를 가리킨다. 새 공개 flag나 비밀 공개변수는 없다.
- `VERCEL_ENV=production`, `VERCEL_GIT_COMMIT_REF=main|master`, 운영/알 수 없는 hostname은 두 flag가 맞아도 차단한다. 허용 호스트는 `dev.pawpong.kr`과 명시적 로컬 주소뿐이다.
- 직접 페이지 주소는 서버에서 404, same-origin `/api/playground/pet/config`는 enabled=false다. 허용 환경에서만 BE config를 no-store로 읽고, BE 404/OFF는 카드/CTA 숨김과 페이지의 안전한 대기로 처리한다.
- 배포 환경값 설정은 총괄 담당이다. 브랜치와 PR은 dev 전용이며 main 전체 승격/PR/배포를 하지 않는다.

## 화면과 상태

기존 FeatureIntro, Button, Input, 픽셀 제목, 크림/노랑 토큰을 재사용한다. 공통 UI와 결제 코드는 변경하지 않는다. 모든 새 주요 조작은 44px 이상이며 라디오 선택, 키보드 포커스, 텍스트 상태, 대체 설명, reduced-motion을 제공한다.

입양 전에는 서버 `eligible-images`의 cursor 페이지를 보여준다. 서버 응답에 없는 sourceJobId, 임의 URL, 필터명 추정으로 입양을 허용하지 않는다. 이름은 NFC/trim 뒤 1~12자이며 미리보기를 제공한다. 입양은 sourceJobId/name/idempotencyKey만 전송한다.

친구 방은 서버의 이미지·레벨·XP·상태·일일 미션·함께한 날·기록을 렌더한다. action은 서버 allowed/rewardAvailable/reason에 따른다. 로컬에 XP/쿨다운/친구 상태를 영속화하지 않는다. 표시용 카운트다운은 serverTime+monotonic elapsed이며 끝나도 서버 재조회 전에는 버튼을 열지 않는다. 휴식 완료는 서버 GET me가 확정한다.

총괄 확정(2026-10-03): v1 배경은 서버 unlocks 중 최고 해금 배경(기본→들판→별빛)을 자동 적용한다. 배경 선택/저장 API는 후속 범위다. 레벨과 unlocks가 서버에 저장되어 새로고침과 다른 세션에서도 같은 배경이 나온다.

## 통신과 계정

- private query는 JWT sub/role/발급 세션과 로그인 세대별로 분리한다. JWT 읽기는 캐시 구분용이며 서버 인증/자격을 대체하지 않는다. 계정 전환 때 이전 요청 응답과 명령을 폐기하고 private cache를 지운다.
- 명령이 진행 중이면 즉시 중복 요청을 막는다. 응답 유실/5xx에는 동일 키·본문만 재전송하며, 불확실한 명령을 새 행동으로 교체하지 않는다.
- 확정 4xx에는 원 명령을 종료하고 409 후 me를 재조회한다. 새 행동은 최신 revision과 새 키로 보낸다.
- 멱등 응답은 과거 view이므로 같은 pet의 낮은 revision을 덮어쓰지 않는다. 성공 후에도 GET me로 최신 serverTime/view를 받는다. XP를 낙관적으로 더하지 않는다.
- 결제, 계정 EXP, 신뢰도, AI quota, 생성 요청을 호출하지 않는다. 빈 화면에서 기존 AI 화면으로만 연결한다.

## 검증

Node 회귀 테스트는 환경 차단, 실제 API 경로/본문, 페이지 자격, 중복/유실/409/오래된 응답, 세션 변경, 서버 상태 렌더를 다룬다. 브라우저 QA fixture는 로컬 전용이며 실제 BE 영속성 검증과 구분한다. 최종 증거는 `/tmp/pawpong-pet-frontend-report.json`에 별도로 기록한다.

실제 검증 항목: 390/768/1440, 로그인/로딩/빈/실패/이미지 실패/입양/4행동/쿨다운/키보드/중복 입력/응답 유실/새로고침/다른 세션/운영 호스트와 빌드 차단, dev 원격 포함 및 main 미포함.
