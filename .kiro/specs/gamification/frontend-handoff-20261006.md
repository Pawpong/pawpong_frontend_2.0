# 희영님 인계 — 포퐁 활동·도트 배지 프론트

기준일: 2026-10-06. 이번 반영 대상은 프론트 `dev`이며 `main`과 운영 공개 설정은 변경하지 않음.

## 반영 범위

- `/my-activity`: 본인의 확인된 EXP, 업적 6종 진행도, 적립·회수·복원 이력 표시함.
- 획득한 배지만 대표 배지로 최대 3개 선택·해제함. 잠금·회수 상태는 선택할 수 없음.
- 커뮤니티 목록에 배지함 진입 링크를 PC·모바일 모두 연결함.
- 커뮤니티 피드 작성자와 게시글 상세 작성자 옆에 선택한 대표 배지 표시함. 홈에서 여는 공용 상세 모달에도 같은 상세 컴포넌트를 사용함.
- 설정이 비활성이거나 조회에 실패하면 진입 링크와 공개 배지를 숨김. 직접 URL에는 이용 불가 상태를 안내함.
- 최초 조회 중 점수·개수를 0으로 단정하지 않음. 계정 변경 뒤 도착한 이전 응답을 폐기하며 구매 Provider 없이 인증 세대를 구독함.

기존 브리더 New/Elite 등급이나 통합 활동 레벨을 복구하는 작업이 아님. EXP를 구매·신뢰도·브리더 인증·검색 순위와 연결하지 않음.

## 원래 작업과 선별 기준

원본 프론트: [Draft PR #422](https://github.com/Pawpong/pawpong_frontend_2.0/pull/422), `kscold/dev-activity-community`.

- `abc7bf5541882e2491542461ded90b570802bb72`: 배지함·도트 배지·API·테스트를 가져옴.
- `8982953a1223f83e5566b918d5150de168b74133`: 커뮤니티 목록/상세의 대표 배지 연결 부분만 가져옴.
- `1fe5a5677e2cdf045cfa91bac614c7970aed85be`: 재사용 가능한 인증 세대 구독 훅만 가져옴.
- 별도 보완: 설정 쿼리 오류가 기존 페이지의 오류 경계로 전파되지 않도록 처리하고 백엔드 404는 미배포/비활성 상태로 처리함.

#422의 커뮤니티 AI 심사, 복합 주제 검색, 경험 지도, AI 참고 답변은 이 반영에 포함하지 않음. #422를 통째로 머지하거나 이미 선별 반영된 배지 파일을 다시 덮어쓰지 말고 최신 dev와 비교하여 남은 변경만 통합해야 함.

## API 계약과 현재 연결 상태

백엔드 원본: [Draft PR #246](https://github.com/Pawpong/pawpong_backend/pull/246), `kscold/dev-activity-achievements`, 확인한 HEAD `ae7831b66ab047e48460e9566be1683bd2d2ac44`.

2026-10-06 확인 시 실제 개발 API의 `GET /api/v2/gamification/config`는 **404**였음. 따라서 프론트 dev 병합만으로 실제 EXP 적립이나 배지 저장 기능이 열리지 않음. 프론트의 숨김 동작은 의도된 상태이며 백엔드 전체 Draft의 머지 완료를 뜻하지 않음.

| 요청                                                              | 입력/응답                                           | 접근                                       |
| ----------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------ |
| FE `GET /api/gamification/config`                                 | `{ enabled: boolean }`, no-store                    | 공개. dev 호스트에서만 개발 BE 설정 조회함 |
| BE `GET /api/v2/gamification/config`                              | `data: { enabled, developmentOnly, policyVersion }` | 공개                                       |
| BE `GET /api/v2/gamification/me`                                  | `ActivityView`                                      | 본인 adopter/breeder 인증                  |
| BE `POST /api/v2/gamification/me/sync`                            | 빈 객체 `{}` → `ActivityView`                       | 서버가 실제 활동과 점수 확인함             |
| BE `PATCH /api/v2/gamification/me/display-badges`                 | `{ keys: string[] }` → `ActivityView`               | 본인, 획득한 최대 3개                      |
| BE `GET /api/v2/gamification/badges?owners=adopter:ID,breeder:ID` | `data: Array<{ ownerId, role, badges }>`            | 공개, 50명 단위, 토큰 전달 안 함           |

BE 응답은 기존 `{ success, data }` 형식임. 정확한 타입은 `src/entities/gamification/model/types.ts` 참조함. `badges`는 key/title/description/target/progress/state/earnedAt, state는 `locked | earned | revoked`임. 공개 조회에는 개인 EXP·이력이 없고 대표 배지만 사용함.

기존 BE 공개 조건은 `APP_ENV=development`와 `GAMIFICATION_DEV_ENABLED=true` 모두 충족임. FE는 `dev.pawpong.kr`, 또는 `NEXT_PUBLIC_APP_ENV=development`인 localhost/127.0.0.1에서만 설정을 확인함. 운영·임의 preview 호스트에서는 비활성임. 환경변수는 이번 작업에서 변경하지 않음.

업적 6종: `first_step` 첫발자국, `first_story` 첫 이야기, `story_connector` 이야기 잇기, `first_introduction` 첫 소개, `on_stage` 무대에 서다, `hall_of_fame` 명예의 전당. 조건·적립량·취소 판정의 원본은 BE 정책임. 양측 확인 상담·입양 완료·후기 업적은 아직 미구현이며 프론트에서 임의로 지급하지 않음.

## 이어받을 순서

1. 깨끗한 본인 체크아웃에서 최신 원격 dev를 반영함. 원본 #422와 이번 선별 반영을 비교함.
2. 백엔드 담당과 #246의 EXP 영역만 별도 검증·배포할지 협의함. 심사 승인과 EXP 회수 의존성이 있으므로 프론트 확인을 위해 #246 전체를 성급히 머지하지 않음.
3. BE 개발 배포가 준비되면 개발 환경 공개 조건과 FE의 API base URL이 개발 서버를 가리키는지 확인하고, FE 설정 응답이 `enabled: true`인지 확인함.
4. 실제 dev 계정으로 프로필·글·댓글 활동 확인 → 배지함 동기화 → 선택/해제 → 목록과 상세 표시 → 새로고침/재로그인 후 저장 유지를 검증함. 잠금/회수 배지 거부와 삭제·비공개·심사 보류 시 회수까지 BE 담당과 함께 확인함.
5. 입양자/브리더 전환, 로그아웃 도중 지연 응답, 모바일·WebView, API 실패·기능 OFF를 확인함.
6. 마이홈 프로필 헤더의 배지 표시와 추가 진입 메뉴는 현 범위에 없음. 필요하면 기획에 따라 후속 UI로 연결함.

## 검증 근거와 한계

- `node --test tests/*.test.cjs`: 420개 통과, 실패/생략 0개.
- 배지 회귀 11개: 개발 호스트 제한, 장애·404 숨김, 계정 경계, 토큰 없는 50명 묶음 조회, API 요청 계약, 3개 선택 한도, 미획득/회수 배지 선택 차단, HTML escape 검증함.
- 타입 검사, 변경 TS/TSX 린트, Next 프로덕션 빌드 통과함.
- Orca 내장 브라우저에서 실제 React 컴포넌트를 격리 합성 데이터로 실행함. 대표 배지 해제→다른 배지 선택→공개 배지 갱신과 3개 한도를 확인함.
- 390px/1440px의 실제 iframe viewport에서 각각 2열/3열 배치와 가로 넘침 없음 확인함. OS 모바일 기기나 실제 dev 계정 E2E 검증을 대신하지 않음.
- 실제 dev API는 미배포 404를 확인함. 실제 계정의 적립/선택 저장/회수는 백엔드 배포 뒤 남은 검증임.
- 원본 #422의 CodeRabbit SUCCESS에는 Draft 리뷰 생략 안내가 있었음. 이를 코드 리뷰 완료 근거로 사용하지 않음.
- 격리 fixture 라우트·계정·스크립트는 제품 코드나 커밋에 포함하지 않음. 운영 DB/서버와 스토어를 변경하지 않음.

로컬 화면 근거는 `/Users/kscold/orca/task-artifacts/pawpong-activity-badges-handoff-20261006`에 보존함. PR·dev 병합 커밋·배포 및 작업 공간 정리는 해당 작업의 최종 보고에서 확인함.
