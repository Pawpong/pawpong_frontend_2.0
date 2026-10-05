# 채팅

- 라우트: `/chat`
- 코드 위치: `src/app/(main)/chat/`
- 최종 갱신: 2026-08-25

## 개요

입양 문의 등으로 연결된 상대와 1:1 실시간 대화를 주고받는 화면이다. 방을
고르기 전에는 방 목록만 보이고, 방을 고르면 pc는 목록(사이드바)과 대화창을 동시에
보여주고 mo/tab은 대화창이 화면 전체를 차지한다(뒤로가기로 목록에 복귀).

## 주요 기능

- 채팅방 목록 조회 + 필터(예: 전체/안읽음 등, `ChatFilterTabs`)
- 방 선택 시 실시간 메시지 송수신(`useChatRoom`, 소켓 연결 상태 표시)
- 입양 문의 방이면 상단에 관련 펫 정보 카드 노출(`PetInfoCard`)
- 안내 배너 노출/닫기(`ChatNoticeBanner`)
- 메시지 전송(`ChatMessageInput`), 첨부 메뉴(`ChatAttachMenu`)
- 상대 메시지 읽음 처리(소켓 연결 + 안읽은 메시지 있을 때 자동 `markAsRead`)

## 화면 구성

| 영역 | 설명 | 코드 위치 |
|---|---|---|
| 방 목록(전체 폭) | 방을 하나도 안 골랐을 때 전체 화면을 채우는 목록 | `_ui/ChatRoomList.tsx` |
| 사이드바(pc, 방 선택 후) | 좌측 고정 폭(`26.6875rem`) 방 목록 — 필터+목록 재사용 | `_ui/ChatSidebar.tsx`, `_ui/ChatRoomFilterableList.tsx` |
| 채팅방 헤더 | 상대 닉네임/프로필, 뒤로가기 | `_ui/ChatRoomHeader.tsx` |
| 펫 정보 카드 | 입양 문의 방일 때만, 신청→펫 상세 순으로 조회해 노출 | `_ui/PetInfoCard.tsx` |
| 안내 배너 | mo는 펫 카드 바로 아래 전체 폭, pc는 메시지 스크롤 영역 안 | `_ui/ChatNoticeBanner.tsx` |
| 메시지 목록 | 말풍선 스크롤 영역, 연속된 상대 메시지는 첫 말풍선에만 프로필 | `_ui/ChatMessageBubble.tsx` |
| 메시지 입력창 | 하단 고정, 방이 닫혔거나 미연결이면 비활성화 | `_ui/ChatMessageInput.tsx` |

## 인터랙션 · 상태

- **스크롤/고정 요소**: 새 메시지가 오면 `messagesEndRef.current?.scrollIntoView({
  behavior: 'smooth' })`로 메시지 목록 맨 아래로 자동 스크롤. 별도 sticky/fixed
  헤더는 없음(방 헤더는 그냥 상단에 위치, 스크롤과 무관).
- **의미 있는 로컬 상태**:
  - `activeRoomId` — 이 화면의 핵심 상태. `null`이면 방 목록 전체 화면,
    값이 있으면(pc: 사이드바+대화창 / mo·tab: 대화창 전체 화면)으로 완전히
    다른 레이아웃을 렌더한다.
  - `showNotice` — 안내 배너 노출 여부(닫으면 그 세션 동안 다시 안 보임).
  - `isConnected`/`socketError`(`useChatRoom` 훅) — 소켓 연결 상태에 따라
    메시지 입력창 비활성화 여부, 에러 문구 노출 여부가 갈린다.

## 모션 디테일

- 새 메시지 도착 시 메시지 목록 맨 아래로 `scrollIntoView({ behavior: 'smooth'
  })` — 코드에 명시된 유일한 모션 스펙(부드러운 스크롤, 정확한 지속시간은 브라우저
  기본값).
- 그 외(방 전환, 안내 배너 노출/닫기, 메시지 말풍선 등장)엔 transition 클래스
  없음 — 전부 즉시 전환.

## 사용자 플로우

- 방을 하나도 선택하지 않은 초기 상태 → `ChatRoomList` 전체 화면
- 방 클릭(`onSelectRoom`) → `activeRoomId` 설정 → pc는 사이드바+대화창, mo/tab은
  대화창 전체 화면으로 전환
- 대화창에서 "목록으로"/뒤로가기(`onBack`) → `activeRoomId`를 `null`로 되돌려 다시
  목록 화면
- 방 목록/프로필 로딩 중이거나 실패 시 각각 안내 문구 + (실패 시) 목록으로 복귀
  버튼 노출

## 권한 · 로그인 분기

| 상황 | 노출/동작 결과 |
|---|---|
| 로그인 사용자 | 정상적으로 방 목록·메시지 조회/전송 가능 |
| 비로그인 사용자 | 이 페이지 코드 자체엔 명시적 로그인 체크 없음 — 라우트 보호(미들웨어 등)가 상위에서 처리되는지 별도 확인 필요 |
| 입양 문의가 아닌 일반 방 | 펫 정보 카드(`PetInfoCard`) 노출 안 됨 |

## 반응형 정책

- **pc**: 방 선택 후 `사이드바(고정폭) + 대화창(flex-1)` 좌우 배치, 최대 폭
  `90rem` 가운데 정렬.
- **mo/tab**: 방 선택 후 대화창이 전체 화면(`ChatRoomPanel` 단독). 방 목록으로
  돌아가려면 뒤로가기 필요 — pc처럼 목록이 계속 보이는 사이드바 없음.
- 안내 배너 표시 위치가 브레이크포인트로 갈린다(mo: 펫 카드 아래 독립 배너 /
  pc: 메시지 스크롤 영역 안, 대화 목록과 스크롤 면 공유).
- 채팅 영역 높이는 공통으로 `calc(100dvh-4rem)`(GNB 높이 제외 뷰포트 전체).

## 데이터 · 상태

- 방 목록: `chatQueries.rooms()`.
- 내 프로필: `profileQueries.me()` — `activeRoomId`가 있을 때만 `enabled`.
- 실시간 메시지: `useChatRoom(roomId, currentUserId)`(`features/chat-realtime`) —
  `messages`, `isLoading`, `isError`, `isConnected`, `socketError`, `sendMessage`,
  `markAsRead`, `refetch` 제공.
- 입양 문의 방: `applicationQueries.detail(applicationId)` → 그 결과의 `petId`로
  `adoptionQueries.detail(petId)` 순차 조회, 성공 시에만 `PetInfoCard` 노출.
- 로딩/에러: 방 목록·프로필 로딩 중엔 안내 텍스트, 방 정보 조회 실패 시 "목록으로"
  복귀 버튼. 메시지 로딩/에러도 유사하게 텍스트+"다시 시도" 버튼.

## 엣지 케이스

| 상황 | 현재 처리 상태 |
|---|---|
| 상대 닉네임/펫 이름/메시지가 매우 길 때 | 처리됨 — 각각 `truncate`/`line-clamp-2`로 잘림 |
| 소켓 연결 끊김 | 처리됨 — `socketError` 문구 노출 + 메시지 입력창 비활성화 |
| 방이 닫힌 상태(`status === 'closed'`) | 처리됨 — 입력창 비활성화 |
| 메시지 첨부 이미지 로드 실패 | 확인 안 됨 — `onError` 폴백 코드 미발견, 실제 동작 확인 필요 |
| 메시지 전송 실패 | 부분 처리 — 에러 문구는 노출되나(`role="alert"`, `ChatMessageInput.tsx`) 실패한 메시지 재전송 UI는 확인 안 됨 |

## 접근성

- 확인됨: 더보기·첨부·뒤로가기·첨부 이미지 열기 버튼에 `aria-label` 있음.
  메시지 전송 실패 문구는 `role="alert"`로 표시돼 스크린리더가 즉시 읽어준다.
- 확인 안 됨: 메시지 목록에서 키보드만으로 개별 메시지·첨부를 탐색할 수 있는지,
  방 목록에서 방 선택이 키보드로 되는지는 이 문서 갱신 시점에 확인 안 됨.

## 완료 기준 체크리스트

- ☐ 방 선택 시 pc(사이드바+대화창)/mo·tab(전체화면)이 정확히 분기된다 (필수)
- ☐ 새 메시지가 오면 부드럽게 맨 아래로 스크롤된다 (필수)
- ☐ 소켓이 끊기면 에러 문구가 뜨고 입력창이 막힌다 (필수)
- ☐ 메시지 전송 실패 시 스크린리더 사용자도 실패했음을 알 수 있다 (확인됨 — `role="alert"`)
- ☐ 첨부 이미지 로드 실패 시 대체 UI가 보인다 (확인 필요 — 현재 미구현 가능성)

## 연관 화면

- 입양 문의 방의 펫 정보 카드 → 분양 상세로 연결 가능(정확한 링크는
  `PetInfoCard.tsx` 확인 필요)
- 상대 프로필 등에서 브리더/입양자 홈으로 이동 가능(정확한 트리거는 헤더/버블
  구현에 따름)

## 참고

- `ChatSidebar` 상단에 "navigation bar spacer"(`h-[3.125rem]`)가 있음 — 실제
  네비게이션 바 없이 높이만 맞추는 여백이라, 상단 헤더 레이아웃이 바뀌면 같이
  맞춰야 한다.
- 입양 문의 방 판별은 `room.applicationId` 존재 여부.
