# 운영 Sentry 미해결 오류 점검 (2026-10-16)

## 범위와 증거

Orca 내장 브라우저의 로그인된 Sentry 세션으로 프로젝트 `4512038254936064`의 미해결 목록을 조회했다. 90일 조회에서도 21개이며 다음 페이지는 없다. 각 이슈의 최신 이벤트를 읽었고 일시적인 조회 429는 순차 재조회하여 모두 확인했다. 사용자 정보, 인증 헤더, 요청 본문은 기록하지 않았다.

아래 키의 접두사는 모두 `PAWPONG-WEB-PRODUCTION-`다. 날짜는 UTC다.

| 키      | 최신 발생 | 확인한 실패                                                                               | 처리 및 남은 한계                                                                                                                    |
| ------- | --------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| S, T    | 10-16     | `M_ID`, `app:///executors/200.js:1:761`, Windows Chrome, 앱 프레임 없음                   | 확장 프로그램 출처로 판단. 원본 스택 전체가 확장 프로그램 프로토콜인 이벤트만 수집 제외. 혼합/미확인 스택은 유지                     |
| R       | 10-13     | PATCH `/api/v2/breeder-management/profile` 500, 대표사진 4개 업로드 후 DB의 3장 제한 위반 | 백엔드 스키마를 기존 화면·업로드·도메인 계약인 4장으로 수정. DTO 5장 이상은 400. 운영 적용 대기                                      |
| Q       | 10-06     | GET `/api/v2/home/feature-highlights`, ERR_NETWORK                                        | 일시 조회 실패 자동 복구 보완                                                                                                        |
| P       | 10-06     | GET `/api/v2/ai-image/filters`, ERR_NETWORK                                               | 동일                                                                                                                                 |
| K       | 10-06     | GET `/api/v2/profile/me`, ERR_NETWORK                                                     | 동일                                                                                                                                 |
| J       | 10-06     | GET `/api/v2/chat/rooms`, ERR_NETWORK                                                     | 동일                                                                                                                                 |
| H       | 10-06     | GET `/api/v2/notification/unread-count`, ERR_NETWORK                                      | 동일                                                                                                                                 |
| N       | 10-06     | GET `/api/v2/home/banners`, ERR_NETWORK                                                   | 동일                                                                                                                                 |
| G       | 10-06     | GET `/api/v2/adoption`, ERR_NETWORK                                                       | 동일                                                                                                                                 |
| F       | 10-06     | GET `/api/v2/community/posts`, ERR_NETWORK                                                | 동일                                                                                                                                 |
| M       | 10-06     | GET `/api/v2/contest/current`, ERR_NETWORK                                                | 동일                                                                                                                                 |
| E       | 10-06     | GET `/api/v2/community/hall-of-fame`, ERR_NETWORK                                         | 동일                                                                                                                                 |
| D       | 10-05     | 가입 화면 POST 30초 타임아웃, 주소 `[Filtered]`, 이전 release `4a787e19`                  | 실제 대상 요청은 복원 불가. 기존 안전한 요청 진단 및 수동 재시도 유지. 가입·업로드를 자동 재전송하지 않음. 원인 해결로 보고하지 않음 |
| 4       | 10-03     | POST `/api/v2/adopter/favorite` status 0, 이전 release `7eea1308`                         | 변경 요청의 실패 안내 및 수동 재시도 유지. 과거 통신 단절 자체가 해결됐다고 판단하지 않음                                            |
| C       | 10-03     | GET `/api/v2/community/hall-of-fame/current` 30초 타임아웃                                | 현재 운영 API 200 재확인, 조회 자동 복구 보완                                                                                        |
| 7, 9    | 10-03     | GET `/api/v2/care-map/config` 503                                                         | 현재 운영 API 및 화면 정상 확인, 조회 자동 복구 보완                                                                                 |
| A, 8, B | 10-03     | GET `/api/v2/care-map/places` 503                                                         | 올바른 `kind/latitude/longitude/radius/page`로 현재 운영 API 200 확인, 조회 자동 복구 보완                                           |

10월 6일 이벤트는 iOS WKWebView에서 여러 API가 같은 시각에 status 0으로 실패했다. HTTP 5xx 서버 장애와 구별되는 전송 실패 증거이며, 이동통신·앱 수명주기·CORS 중 정확한 단절 원인까지 확정할 자료는 없다. 이번 변경은 일시 실패 후 화면이 오류 상태에 남는 문제를 해결한다. 기존 Sentry API 오류 수집과 분당 예산은 유지하고 이슈를 일괄 해결/무시 처리하지 않았다.

## 수정

- 공통 QueryProvider가 활성 조회의 ApiError 중 연결 실패·5xx만 30초 주기, 화면 복귀, 네이티브 `pawpong:app-active`에서 재조회한다. 정상 캐시, 4xx, 취소된 요청, 비활성 조회와 mutation은 이 복구 대상에서 제외한다. 앱 복귀 시 계정 경계를 먼저 확인하고 진행 중 재조회는 취소하지 않는다.
- 취소된 조회는 초기 자동 retry에서도 제외한다. 실제 장애는 계속 Sentry에 남는다.
- 브라우저 Sentry 필터는 `hint.originalException.stack`을 실제 SDK parser로 읽는다. 정규화된 `app:///`나 메시지만으로 필터링하지 않는다. 모든 원본 프레임이 확장 프로그램 주소이고 단일 예외일 때만 제외한다. 앱 프레임이 한 개라도 섞이거나 원본이 없거나 원인 체인이 있으면 보존한다. 서버 Sentry 설정은 변경하지 않는다.
- S/T의 파일명·함수·행·열은 [별도 프로젝트에서 확인한 확장 프로그램 사례](https://github.com/debpalash/VoiceStudio/issues/1901)와 일치한다. 포퐁 소스에 해당 식별자와 자산이 없다는 점을 함께 근거로 삼았다. 브라우저 확장 프로그램 자체를 수정한 것은 아니다.
- 대표사진 DB 수정은 `Pawpong/pawpong_backend`의 별도 커밋으로 반영한다. 사진을 3장으로 줄이거나 기존 사진을 삭제하지 않는다.

## 검증

- 프런트 전체 Node 테스트 1,542개 통과. 실제 TanStack Query로 fresh 캐시가 있는 조회 실패 후 focus 복구, 네이티브 복귀, 정상 캐시 보존, 401/취소/비활성 제외, mutation 재전송 금지를 확인했다.
- 실제 Sentry parser로 확장 프로그램 전용/앱 혼합/동일 메시지의 앱 오류/원본 부재/원인 체인 경계를 확인했다.
- 변경 소스 ESLint, TypeScript, production build 통과. 최신 lockfile에 있던 누락된 로컬 의존성은 `pnpm install --frozen-lockfile`로 복구했으며 lockfile 변경은 없다.
- 백엔드 관련 unit 277개, 프로필 HTTP/DB 및 기존 응답 계약 8개 통과. 실제 Nest 앱과 격리 Mongo에서 4장 저장·공개 조회, 5장 400과 기존 사진 보존, 사진 필드 생략·전체 제거를 확인했다. 타입 검사·변경 소스 lint·build 통과.
- 위 인증·저장 테스트는 합성 계정과 격리 DB 검증이다. 실제 심사 계정 로그인 또는 운영 데이터 변경 검증이 아니다.
- Orca 브라우저에서 운영 탐색 화면과 지도 설정/시설·명예의 전당·배너·기능 소개·이미지 필터 API를 읽어 현재 응답을 확인했다.
- 로컬 production 빌드의 탐색 화면에서 연결 실패 안내를 확인한 뒤, 검증 탭의 GET 주소만 실제 개발 API로 임시 연결하고 앱 복귀 이벤트를 보냈다. 페이지를 새로 고치지 않고 오류 안내가 사라지고 브리더 카드 링크 40개가 나타났다. 로컬 실패 유도와 실제 개발 백엔드 읽기를 결합한 검증이며 운영 통신 단절 재현이나 실제 iPhone 검증은 아니다.
- 별도 `codex review --uncommitted`는 설치된 CLI 0.147.0의 모델 호환 오류로 실행되지 않았다. 자동 리뷰 성공으로 보고하지 않으며 직접 diff를 검토했다.

## 반영 경계

최신 원격 dev를 시작·중간·최종에 fetch하여 확인한다. 공유 기본 dev 체크아웃에서 본인 파일만 커밋하며 브랜치 전환이나 새 브랜치 생성은 하지 않는다. 별도의 작업용 워크스페이스를 만들지 않았으므로 기본 저장소는 유지하고 검증용 터미널·브라우저 탭만 정리한다.

main/master 병합과 운영 배포는 별도 지시까지 보류한다. 인앱결제 비활성 및 다마고치 품질 승인·공개 OFF는 유지한다. 운영 오류 재발 소멸은 운영 적용 후 별도 관찰이 필요하다.
