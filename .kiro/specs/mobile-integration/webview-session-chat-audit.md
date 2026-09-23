# WebView 웹 인증·채팅·파일·브리지 감사 및 수정 검증

검증일: 2026-09-24 KST. 최초 읽기 전용 감사 후 사용자 승인에 따라 수정·검증·dev push까지 수행했다. 웹 기준은 `d17f38b`, 대조한 RN 원본 master는 `8b17ae5`, RN dev-splash 최초 기준은 `96ba0d3`이다. 네이티브 업데이트·OTA·배포 버전 정책은 별도 담당 보고를 따른다.

웹 수정 커밋: `87919d6`(인증), `987674c`(채팅), `ac7c7bc`(공유·사진 브리지). 아래 현재 파일 줄은 이 세 커밋 기준이다.

## 확인된 결함과 수정

| 심각도 | 재현 조건과 영향                                                                                                                                                                                                          | 확인 근거·수정 위치                                                                                                                                                                                                                                  | 배포 범위                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| P1     | access 쿠키가 만료됐지만 HttpOnly refresh 쿠키는 유효한 상태로 보호 페이지를 연다. 서버 가드는 로그인으로 보내고 이전 로그인 화면은 access 쿠키만 검사해 자동 복구하지 않았다. 앱 재방문 때 불필요한 재로그인이 발생한다. | 기존 `src/features/auth/lib/requireRole.ts:16`, `d17f38b:src/features/auth/ui/SocialLoginList.tsx:98`; 수정 `src/shared/lib/authSessionRecovery.ts:115`, `src/shared/lib/SessionRecoveryBridge.tsx:8`, `src/features/auth/ui/SocialLoginList.tsx:98` | 웹만. 초기 진입·online·pageshow·visibilitychange는 구형 앱에서도 동작한다.                |
| P1     | API 401 후 refresh가 일시적 네트워크 장애 또는 5xx로 실패한다. 이전 공통 catch가 refresh 쿠키까지 삭제해 유효 세션을 잃었다.                                                                                              | 기존 `d17f38b:src/shared/api/client.ts:127`, `:171`; 수정 `src/shared/lib/authSessionRecovery.ts:72`, `:100`, `src/shared/api/client.ts:98`                                                                                                          | 웹만. 확인된 refresh 401만 쿠키를 삭제한다.                                               |
| P1     | Socket이 connected인 순간 보내기를 누른 뒤 전송/저장/응답이 실패한다. 이전 코드는 emit 직후 true를 반환해 텍스트를 지웠고 저장 성공을 확인하지 않았다.                                                                    | 기존 `d17f38b:src/features/chat-realtime/model/useChatSocket.ts:92`, `d17f38b:src/app/(main)/chat/_ui/ChatMessageInput.tsx:52`; 수정 `src/features/chat-realtime/model/chatDelivery.ts:24`, `src/app/(main)/chat/_ui/ChatMessageInput.tsx:80`        | 초안 보존과 본인 echo 확인은 웹만. 저장 ACK 및 재전송의 DB 중복 방지는 백엔드도 필요하다. |
| P2     | 오프라인 로그아웃 중 clear-cookie 요청이 실패한 뒤 문서를 다시 연다. 이전 문서 메모리의 로그아웃 의도가 사라지고 잔여 HttpOnly 쿠키가 남는다.                                                                             | 기존 logout은 서버 cookie clear fetch에 의존; 수정 `src/shared/lib/authSessionLifecycle.ts:4`, `:25`, `src/shared/lib/authSessionRecovery.ts:35`, `src/shared/lib/SessionRecoveryBridge.tsx:11`                                                      | 웹만. JS 쿠키 즉시 제거, 로컬 로그아웃 의도 보존, 재접속 시 서버 쿠키 삭제 재시도.        |
| P2     | 채팅 REST 복구에서 읽음 상태가 true가 된 뒤 오래된 같은 ID echo가 합쳐진다. 이전 병합의 덮어쓰기로 false가 되돌아갈 수 있었다.                                                                                            | 수정 `src/features/chat-realtime/model/mergeChatMessages.ts:4`; 회귀 검증 `tests/chat-delivery.test.cjs`                                                                                                                                             | 웹만. 읽음 true를 유지하고 ID로 병합한다.                                                 |
| P2     | 같은 채팅 패널 컴포넌트에서 다른 방으로 이동한다. 이전 방의 입력 상태가 새 수신자 화면에 남을 수 있었다.                                                                                                                  | 수정 `src/app/(main)/chat/_ui/ChatPageContent.tsx:105`, `:124`의 `key={activeRoom.roomId}`; 현재 메시지 ID는 입력 초안/첨부마다 소유하며 `ChatMessageInput.tsx:55`, `:83`, `:121`에서 생성한다.                                                      | 웹만. 방 변경은 패널을 새로 만들고, 같은 텍스트의 새 초안은 다른 ID를 갖는다.             |

최종 검토에서 발견한 두 회귀도 수정했다. 본문 문자열을 Map 키로 사용하면 확인을 잃은 예전 전송 ID가 나중에 작성한 같은 문장에 재사용되므로 입력 초안이 ID를 소유하도록 바꿨다. refresh 응답 헤더만 수신되고 본문이 멈추는 경우에도 시간 제한을 유지하도록 본문 읽기를 abort 범위에 포함했다(`authSessionRecovery.ts:28`). 두 경우 모두 실행 가능한 회귀 테스트를 추가했다.

## 구현 누락과 추가된 계약

| 우선순위 | 기존 누락·영향                                                                                                              | 현재 구현                                                                                                                                                                                                                            | 웹/네이티브/백엔드 경계                                                                                                                                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | 저장 ACK 및 호출자 전송 ID가 없어 응답 유실 후 재전송을 같은 메시지로 식별할 수 없었다.                                     | `chatDelivery.ts:24`, `useChatRoom.ts:122`, `src/shared/types/ChatTypes.ts:32`, `:45`의 optional `clientMessageId`. 저장 ACK 또는 자신의 대응 echo까지만 성공 처리한다. timeout/disconnect는 unconfirmed이며 자동 재전송하지 않는다. | 웹+백엔드. 백엔드는 `(senderId, roomId, clientMessageId)` unique와 동일 내용 재시도의 동일 messageId ACK를 제공한다. 구형 서버는 자신의 echo로 확인하며 DB 중복 방지는 보장할 수 없다. 구형 클라이언트의 필드 없는 payload는 유지된다. |
| P2       | 강제 disconnect 이후 앱으로 돌아왔을 때 별도 연결 재시도 및 누락 내역 복구 신호가 부족했다.                                 | `useChatSocket.ts:92`에서 세션 복구 뒤 connect 또는 REST invalidate. access 쿠키 변경을 `src/shared/lib/useAccessToken.ts:17`로 구독한다.                                                                                            | 기존 visibility/online/pageshow는 웹만. `pawpong:app-active` 추가 신호는 대응 RN이 필요하다.                                                                                                                                           |
| P2       | 웹 ShareModal에 네이티브 OS 공유 요청 및 결과 상관관계가 없었다.                                                            | `src/shared/ui/ShareModal.tsx:140`, `src/shared/lib/nativeBridge.ts:69`: capability 확인 후 SHARE/SHARE_RESULT, requestId, cancel, timeout.                                                                                          | 네이티브 capability가 있는 앱에서 활성화. 브라우저는 navigator.share 지원 시 사용하고 구형 앱은 기존 공유/URL 복사 경로를 유지한다.                                                                                                    |
| P2       | Android 이미지 input이 런타임 카메라 권한 요청과 연결되지 않았다.                                                           | `src/shared/lib/NativePhotoPickerBridge.tsx:16`: CAMERA_PERMISSION_RESULT 후 실제 사용자 탭으로 input을 다시 연다. 권한 거절·응답 유실 때도 보관함 선택 안내를 제공한다.                                                             | 카메라 capability를 제공하는 RN 필요. 구형 앱에서는 기존 file input을 가로채지 않는다. 웹 배포만으로 OS 권한 구현을 추가할 수 없다.                                                                                                    |
| P2       | 채팅 사진 첨부만 기존 공용 웹 호환 사진 변환을 우회하고 원본 파일을 업로드했다. 사진 형식 정책이 다른 업로드 화면과 달랐다. | 기존 `d17f38b:src/app/(main)/chat/_ui/ChatMessageInput.tsx:75`; 수정 `src/app/(main)/chat/_ui/ChatMessageInput.tsx:110`, `src/app/(main)/chat/_ui/ChatAttachMenu.tsx:70`에서 기존 preparePhoto와 PHOTO_ACCEPT 사용.                  | 웹만. 실제 OS 사진을 끝까지 업로드하고 수신 기기에서 디코딩하는 검증은 별도로 남는다.                                                                                                                                                  |

브리지 활성화는 `ReactNativeWebView` 존재와 `__PAWPONG_APP__.capabilities`의 개별 true를 모두 요구한다(`nativeBridge.ts:8`). bridgeVersion 숫자만으로 신규 명령을 보내지 않는다. requestId가 맞는 window/document 응답만 완료 처리한다. 카메라 대기 30초, 공유 대기 60초이며 앱 미지원이면 즉시 기존 경로를 유지한다.

공유 URL은 현재 origin이다. `FavoriteShareActions.tsx:67`은 url prop 없이 ShareModal을 열고 `ShareModal.tsx:134`는 현재 페이지 주소를 사용한다. 운영 HTTPS 페이지는 HTTPS를 공유하고 로컬3021은 HTTP를 공유한다. 로컬 fixture의 존재하지 않는 pet을 운영 URL로 바꾸지 않았다. 네이티브의 HTTPS 전용 공유 정책에 따른 로컬 거절은 운영 공유 실패와 구분한다.

## 이미 구현돼 있던 것과 잘못된 결함 보고에서 제외한 것

- RN master `8b17ae5`의 Google 시스템 인증은 이미 구현돼 있었다. `pawpong_rn/src/screens/HomeScreen.tsx:139`에서 Google 시작 URL을 시스템 인증으로 전환하고 `src/features/native-auth/model/googleAuthSession.ts:32`에서 시도 수명, PKCE, state 및 취소를 검사한다. dev-splash의 오래된 Google WebView 정책만 보고 master에도 누락됐다고 판단하지 않았다. RN 담당은 master를 dev에 병합했다.
- RN master의 푸시 토큰 갱신·해제 경합 수정과 웹의 로그아웃 generation/cookie write 대기 및 native 해제 ACK 대기는 기존에 있었다. `src/shared/lib/nativePushSession.ts:47`, `src/features/auth/api/auth.api.ts:9`를 확인했고 새로 만든 기능으로 보고하지 않는다.
- 기존 채팅에도 Socket.IO 재연결, reconnect 후 join/refetch, 3초 REST fallback, 수신 messageId 중복 병합이 있었다. 이번 변경은 전송 확인·재시도 식별·복귀 신호·읽음 단조 병합을 추가한 것이다.
- 실제 파일 열기는 `src/app/(main)/chat/_ui/ChatMessageBubble.tsx:68`(이미지), `:90`(파일)의 업로드 URL `_blank` 링크이다. blob URL 다운로드 코드는 없으며 blob 사용은 이미지 미리보기/디코딩과 revoke에 한정된다. `useImageUpload.ts:39`, `preparePhoto.ts:31`, `RepresentativePhoto.tsx:28`에서 확인했다. native blob 저장 구현을 현재 제품의 필수 결함으로 분류하지 않는다.
- 탈퇴 UI는 `src/app/(main)/settings/_ui/SettingsContent.tsx:88`에서 탈퇴 성공 후 공통 logoutAndRedirect를 호출한다. 이미 열린 socket의 탈퇴·정지·만료 계정 차단은 백엔드 권한 재검증/연결 해제 담당의 수정 범위이며 웹만으로 해결했다고 주장하지 않는다.

## 실제 검증 결과

외부 발송을 끈 실제 Nest 앱, MongoMemoryReplSet, API8088, 별도 Next3021과 Orca 격리 브라우저 프로필을 사용했다. 기존3000/8080 서버·DB 및 기존 브라우저 로그인 세션은 보존했다. 실제 자격증명은0600 임시 파일에서만 읽고 결과에는 쿠키·토큰을 출력하지 않았다.

| 검증                                                               | 결과                                                                                                                                                                                     |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| access 쿠키만 제거하고 로그인 페이지를 재진입                      | 실제 refresh200 1회 → set-cookie200 1회 → access 쿠키 복구 → 홈으로 이동.                                                                                                                |
| 실제 로그아웃 버튼 클릭 후 재진입                                  | access 쿠키 없음, 로그인 메뉴 표시, refresh401 및 clear-cookie200. 세션이 되살아나지 않음.                                                                                               |
| 실제 Socket.IO 두 클라이언트 + 저장 후 호출자의 첫 ACK/echo만 유실 | 원본 `deliverChatMessage`는 unconfirmed. 동일 ID 재전송 결과는 원래 messageId, REST 저장1행, 상대방 수신1회.                                                                             |
| 기존 clientMessageId 없는 payload                                  | 실제 저장 성공.                                                                                                                                                                          |
| Socket 연결 종료 후 다시 연결·REST 복구                            | 저장된 메시지1행 유지, 내역 복구 성공.                                                                                                                                                   |
| 실제 채팅 UI에서 전송 패킷1회 유실                                 | 확인 중 중복 전송 잠금, 10초 후 초안 보존 및 재시도 가능.                                                                                                                                |
| 위 UI에서 WebSocket 종료 → app-active → 재전송                     | 초안 유지, 재접속 후 실제 전송1회, REST200/저장1행/clientMessageId 있음, 성공 후 입력 삭제.                                                                                              |
| RN 담당의 실제3021/profile/edit 확인                               | iOS Photo Library/Take Photo/Choose File 메뉴와 Android CAMERA prompt→권한 승인→웹 사진 선택 CTA→Camera/Media picker 확인. 첫 Android 권한 응답30초 초과 때도 보관함 선택 경로가 유지됨. |
| RN 담당의 Pixel8 실제 웹 채팅 키보드                               | 소프트키보드 표시 후 테스트 문자열을 입력했고 입력창·보내기 버튼이 키보드 위에 남음을 확인. 미전송. RN 보고의 `evidence/android-real-chat-keyboard.png` 참조.                            |
| 브라우저의 실제 사진 선택 모달 + 모의 native 권한 ACK              | 첫 input click은 차단, 사진 선택 CTA의 두 번째 click은 userActivation=true, 모달 닫힘. OS 카메라 권한 검증과 구분한다.                                                                   |
| 자동 회귀 테스트                                                   | `node --test tests/*.test.cjs tests/*.test.mjs`:73/73 통과. auth 복구6개, chat7개, native bridge3개 포함.                                                                                |
| 정적/빌드                                                          | `pnpm exec tsc --noEmit --incremental false`, 변경 TS/TSX ESLint, `git diff --check` 통과. 임시 인증 route를 제거한 최종 코드의 production build37페이지도 다시 통과했다.                |
| FSD 검사                                                           | 기존 오류8개로 실패. slice 수와 기존 계층 import 문제이며 이번 변경이 추가한 direct token import 경고는 제거함. 전체 FSD 통과로 보고하지 않는다.                                         |

실제 두 Socket 검증의 비밀 없는 수치는 [저장·재전송 증거](../webview-operation/evidence/chat-delivery.json)에 보존했다.

RN 담당은 실제 iOS ShareModal에서 로컬 HTTP 공유 요청 거절 후 URL 복사 안내를 확인했다. 운영 HTTPS 공유시트 성공은 이 결과에 포함하지 않는다. iOS 채팅 텍스트 입력은 확인했으나 시뮬레이터가 하드웨어 키보드 모드여서 소프트키보드 높이 변화는 미검증이다.

## 남은 실기기 검증 공백

- `ChatRoomPanel.tsx:69`의100dvh-4rem과 `ChatMessageInput.tsx:92`의 isComposing Enter 방어만으로 iOS/Android 모든 키보드·한글 조합·회전 조합을 검증했다고 할 수 없다. Pixel8 에뮬레이터의 기본 키보드는 입력창/전송 버튼이 가리지 않는 것을 RN 담당이 확인했다. iOS 및 모든 한글 IME·기기 조합의 결과는 별도 네이티브 담당 관찰을 따른다. 정적 코드만으로 키보드 결함을 확정하지 않았다.
- 실제 공급자의 Google/Apple/Kakao/Naver 계정 선택·취소·앱 복귀와 장기간 쿠키 지속성은 이 격리 fixture가 검증하지 않는다. Google/푸시 경합은 이미 수정된 코드와 기존 테스트를 확인한 범위다.
- 실제 Android 카메라 촬영, iOS 사진/파일 앱, 외부 다운로드 MIME/Content-Disposition 및 설치된 공유 앱별 결과는 네이티브 담당 검증 기록을 따른다. 브라우저 모의 ACK 성공을 OS 성공으로 바꾸어 적지 않는다.
- 앱 프로세스 종료 또는 페이지 전체 reload를 가로지르는 채팅 초안의 영구 저장은 이번 구현에 포함하지 않는다. 이번 초안 보존 보장은 동일 문서에서 전송 확인 실패 및 연결 복구 때 적용된다.

웹 기능 수정은 앱 스토어 업데이트 없이 배포 가능하다. 재전송 중복 방지 전체 보장은 백엔드 배포가 필요하며, 신규 카메라/OS 공유/app-active 기능은 대응 RN capability를 제공하는 앱에 적용된다. RN 바이너리와 OTA의 세부 적용 가능 범위는 네이티브·배포 보고서에서 판정한다.

검증 후 임시 `/api/local-webview-audit` 인증 route를 삭제하고3021에서404를 확인했다. 이 route는 커밋되지 않았으며 최종 빌드 라우트 목록에도 없다. 사용한 격리 브라우저 탭과 프로필은 삭제했다. RN 담당의 기기 검증 완료 후 별도3021 서버의 Orca 터미널도 닫았다. 기존3000/8080은 종료하지 않았다.
