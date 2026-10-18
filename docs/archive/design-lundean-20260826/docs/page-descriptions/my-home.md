# 마이홈

- 라우트: `/home` (내 마이홈), `/home/[userId]` (다른 사용자의 홈 — 이 문서 범위 밖, 별도 확인 필요)
- 코드 위치: `src/app/(main)/home/`
- 최종 갱신: 2026-08-25

## 개요

로그인한 사용자 본인의 프로필과 활동(작성 글, 즐겨찾는 브리더, 브리더면 분양
목록)을 확인·관리하는 화면이다. 역할(입양자/브리더)에 따라 탭 구성과 상단 작성
유도 문구가 달라진다.

## 주요 기능

- 프로필 카드 열람(입양자/브리더 공통 `ProfileCard`, 브리더는 `mine-breeder` 모드)
- 역할별 탭 전환: 입양자는 게시글/즐겨찾는 브리더, 브리더는 분양목록/게시글/즐겨찾는 브리더
- 브리더 전용: 분양목록 그리드(모바일 카드형/tab+ 즐겨찾기 카드형)
- 게시글 탭: 내가 쓴 커뮤니티 글 목록, 임시저장 있으면 이어쓰기 진입점 노출
- 게시글 수정(상세 편집 모드로 이동)/삭제(확인 모달)
- 즐겨찾는 브리더 목록(`FavoriteBreedersContent`)
- 북마크 바로가기(상단 네비게이션 바 우측 아이콘)

## 화면 구성

| 영역 | 설명 | 코드 위치 |
|---|---|---|
| 네비게이션 바 | 타이틀 "마이홈" + 우측 북마크 아이콘, tab+에서 GNB 아래 sticky | `_ui/MyHomeContent.tsx` (`NavigationBar`) |
| 프로필 카드 | 역할별 프로필 정보(닉네임/소개/BPM/팔로워 등) | `_ui/ProfileCard.tsx` |
| 탭 바 | 역할별 탭 구성(`MY_HOME_TABS` / `BREEDER_MY_HOME_TABS`), tab+ sticky(GNB+navbar 아래) | `_ui/HomeTabs.tsx`, `_ui/constants.ts` |
| 작성 유도 바 | "게시글을 올려보세요"(입양자→`/community/write`) 또는 "분양글을 올려보세요"(브리더→`/adoption/create`) | `_ui/MyHomeContent.tsx` (`InputUpload`) |
| 분양목록 탭(브리더만) | mo 2열 그리드 카드 / tab+ 3열 즐겨찾기형 카드 | `_ui/BreederListingCard.tsx`, `features/adoption` |
| 게시글 탭 | 임시저장 배너(있을 때만) + 내가 쓴 글 목록 | `_ui/PostList.tsx` |
| 즐겨찾는 브리더 탭 | 즐겨찾기한 브리더 목록 | `_ui/FavoriteBreedersContent.tsx` |

## 인터랙션 · 상태

- **스크롤/고정 요소**: 3단 sticky 스택 — GNB → 네비게이션 바(`top: gnbH`) →
  탭 바(`top: gnbH + navH`), tab+에서만 적용(`tab:sticky`). 네비게이션 바의
  실측 높이(`navH`)는 `ResizeObserver`로 추적해서 탭 바 위치를 자동 보정 —
  네비게이션 바 내용이 바뀌어 높이가 달라져도 탭 바가 그 아래 딱 붙는다.
- **의미 있는 로컬 상태**:
  - `activeTab` — 역할별 탭 세트(`MY_HOME_TABS`/`BREEDER_MY_HOME_TABS`) 중 현재
    탭. 기본값도 역할에 따라 다르다(브리더는 `listings`, 입양자는 `posts`).
  - `deleteTargetId` — 게시글 삭제 확인 모달 대상. `null`이 아니면 모달이 뜬다.

## 모션 디테일

grep 기준으로 이 페이지 코드엔 `transition`/`duration` 클래스 없음 — 탭 전환,
sticky 등장 모두 즉시 전환. **모션 요소 없음.**

## 사용자 플로우

- 진입 시 `profileQueries.me()`로 내 역할을 먼저 확인 → 역할에 맞는 탭 세트와
  기본 탭(브리더는 `listings`, 입양자는 `posts`)을 결정
- 게시글 카드 "⋯" → 수정 클릭 시 `/community/[postId]/edit`, 삭제 클릭 시 확인
  모달 → 확인 시 삭제 API 호출(성공해야 모달 닫힘)
- 임시저장 배너 클릭 → `/community/drafts`
- 작성 유도 바 클릭 → 역할별로 `/community/write` 또는 `/adoption/create`
- 북마크 아이콘 클릭 → 북마크 화면으로 이동(정확한 경로는 아이콘 핸들러 확인 필요,
  현재 라벨만 "북마크"로 렌더되어 있음)

## 권한 · 로그인 분기

이 페이지 전체가 사실상 역할 분기로 이루어져 있다 — 표로 모아서 본다.

| 역할/상황 | 노출 결과 |
|---|---|
| 브리더 | 탭: 분양목록·게시글·즐겨찾는 브리더(`BREEDER_MY_HOME_TABS`), 기본 탭 `listings`, 작성 유도 바 "분양글을 올려보세요" → `/adoption/create` |
| 입양자 | 탭: 게시글·즐겨찾는 브리더(`MY_HOME_TABS`), 기본 탭 `posts`, 작성 유도 바 "게시글을 올려보세요" → `/community/write` |
| 프로필 조회 실패(비로그인 포함 추정) | 화면 자체가 렌더되지 않음(`return null`) — 안내 문구 없이 빈 화면, 아래 엣지 케이스 참고 |
| 게시글 소유자 본인 | "⋯" 메뉴로 수정/삭제 가능(`PostList` 내부) |

## 반응형 정책

- 네비게이션 바: mo는 좌우 여백 `px-12`(디자인상 공통 기본 16px을 덮어씀,
  마이홈 전용)로 tab 여백을 모바일에도 그대로 적용.
- 프로필 카드 섹션 패딩: mo `px-4 py-5`, tab+ `py-10`.
- 게시글 탭 패딩: mo `px-4 py-6`, tab+ `py-10`.
- 분양목록 탭: mo/tab 이하는 2열 카드형(`BreederListingCard`) 그리드, tab+부터는
  3열 즐겨찾기 카드형(`FavoriteAdoptionCard`)으로 완전히 다른 카드 컴포넌트를 씀
  (같은 컴포넌트의 반응형 분기가 아니라 두 개를 각각 렌더하고 `hidden`으로 전환).
- 탭 바 sticky 오프셋은 GNB 높이 + 네비게이션 바 실측 높이(`ResizeObserver`로
  추적)를 더해 계산 — 네비게이션 바 높이가 바뀌면 자동으로 따라간다.

## 데이터 · 상태

- 내 프로필: `profileQueries.me()` — 응답 없으면(`!adopterPublicProfile &&
  !breederPublicProfile`) 화면 자체를 렌더하지 않음(`return null`).
- 내가 쓴 글: `communityQueries.myPosts(!!myProfile)` — 프로필 로드 후에만 활성화.
- 임시저장 글 수: `communityQueries.drafts(!!myProfile)` — 0개면 이어쓰기 배너
  자체를 숨김.
- 브리더 분양목록: 현재 `createMockListings()` 목업(실 API 미연결, 메인
  홈/탐색과 동일한 상황).
- 게시글 삭제: `useDeleteCommunityPost()` — 성공 콜백에서만 확인 모달을 닫아,
  실패 시 재시도 가능하게 유지.

## 엣지 케이스

| 상황 | 현재 처리 상태 |
|---|---|
| 내 프로필 조회 실패(`!adopterPublicProfile && !breederPublicProfile`) | 미흡 — 안내 문구 없이 화면 전체가 빈 화면(`return null`)이 됨, 사용자가 뭐가 잘못됐는지 알 수 없음 |
| 임시저장 글 0개 | 처리됨 — 이어쓰기 배너 자체를 숨김 |
| 닉네임 등 긴 텍스트 | 처리됨 — `BreederCard` 등에서 `truncate` |
| 게시글 삭제 API 실패 | 처리됨 — 확인 모달을 닫지 않고 재시도 가능하게 유지 |
| 브리더 분양목록 API 실패 | 해당 없음 — 현재 목업 고정이라 실패 상태 자체가 없음 |

## 접근성

- 확인됨: 탭 바(`ariaLabel="홈 콘텐츠"`), 북마크 아이콘(`aria-label="북마크"`)에
  라벨 있음. 즐겨찾기 버튼은 텍스트 라벨이 없을 때만 `aria-label="즐겨찾기"`를
  붙임(`BreederCard`) — 조건부이긴 하지만 의도적으로 처리돼 있음.
- 확인 안 됨: 탭 전환·게시글 "⋯" 메뉴가 키보드만으로 조작 가능한지는 확인 안 됨.

## 완료 기준 체크리스트

- ☐ 브리더/입양자 로그인 시 각각 올바른 탭 세트와 기본 탭이 뜬다 (필수)
- ☐ 임시저장 글이 있을 때만 이어쓰기 배너가 보인다 (필수)
- ☐ 게시글 삭제 실패 시 모달이 닫히지 않고 재시도할 수 있다 (필수)
- ☐ 프로필 조회 실패 시 빈 화면 대신 안내 문구나 에러 화면이 보인다 (확인 필요 — 현재 미구현)
- ☐ 탭 전환·게시글 메뉴가 키보드만으로 조작된다 (확인 필요)

## 연관 화면

- `/community/write`, `/adoption/create` (작성 유도 바)
- `/community/[postId]/edit` (게시글 수정)
- `/community/drafts` (임시저장 이어쓰기)
- 북마크 화면(정확한 경로 미확인 — 아이콘 클릭 핸들러 구현 필요 시 확인)

## 참고

- Figma 참조(코드 주석 기준): 네비게이션 바 node 2046-160996, 모바일 게시글 탭
  node 1023-23241, 탭·PC 게시글 탭 node 2046-160971.
- `TabPanel`은 탭 콘텐츠 공통 래퍼(`TabsContent` + `Container`)로, py 등 추가
  여백만 탭별 className으로 주입하는 구조 — 새 탭 추가 시 이 패턴을 따르면 된다.
