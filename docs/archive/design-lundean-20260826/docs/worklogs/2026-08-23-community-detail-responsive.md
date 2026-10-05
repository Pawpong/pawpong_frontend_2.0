# 커뮤니티 피드 상세 모달/페이지 반응형 구현

- 작성자: 최은진
- 날짜: 2026-08-23
- 범위: 커뮤니티 피드 상세 보기(모달/페이지)의 반응형 UI 및 인터랙션

## 요청 배경

커뮤니티 피드 카드의 댓글(편지) 아이콘을 클릭했을 때 게시물 상세를 보여주는 화면을,
바탕화면의 참고 프로젝트(`pawpong/src/components/community/FeedCard.tsx`,
`FeedDetailModal.tsx`)와 동일한 반응형 정책으로 맞춰달라는 요청이었다: pc·tab은
모달로, mo는 모달이 아니라 실제 페이지 이동으로 상세를 보여주되, mo 페이지는 tab
모달과 같은 레이아웃을 쓴다. 이후 실제로 화면을 확인하는 과정에서 mo 네비게이션
불량, mo 피드 여백, tab 모달의 스크롤 구조, tab 모달 크기 등 세부 이슈가 이어서
발견되어 순차적으로 수정했다.

## 진행한 작업

### 반응형 정책 요약

| 브레이크포인트 | 진입 방식 | 내부 레이아웃 |
|---|---|---|
| pc (1440px~) | 모달 (인터셉트 라우트) | 사이드바이사이드 — 이미지 60% / 정보(헤더·캡션·댓글·액션) 40% |
| tab (768~1439px) | 모달 (인터셉트 라우트) | 스택형 — 이미지→헤더→캡션→댓글 순으로 쌓임, 화면 중앙의 작은 박스 |
| mo (~767px) | 실제 페이지 이동 (라우트 전환) | tab 모달과 동일한 스택형, 다만 모달이 아니라 풀페이지 |

### 1. 인터셉트 라우팅 기반 모달/페이지 분기

Next.js Intercepting Routes(`community/@modal/(.)[postId]`)로 피드 화면을 유지한 채
상세를 모달로 띄우는 기존 구조는 그대로 사용했다. `PostDetailModal`에서
`useBreakpoint('tab')`으로 뷰포트를 판정해서, mo로 확정되면 모달을 그리지 않고
실제 상세 페이지(`[postId]/page.tsx`)로 넘어가도록 했다.

- 처음엔 `router.replace`로 넘겼는데, 인터셉트 라우트는 이미 그 경로에 소프트
  네비게이션으로 들어와 있는 상태라 같은 경로로 다시 `router.replace`를 호출해도
  Next.js가 인터셉트 렌더(모달)를 그대로 유지해버려 mo에서 클릭해도 페이지로
  안 넘어가는 버그가 있었다. `window.location.replace`로 하드 네비게이션을
  강제해서 해결했다.

### 2. tab 모달 크기 — 뷰포트 폭에 비례한 반응형 크기

기존엔 tab 전 구간(768~1439px)에서 모달이 폭 420px·최대 높이 680px로 고정돼
있어 "반응형 크기"가 사실상 없었고, 화면이 넓어져도 항상 똑같이 작아 보였다.

- **가로**: `w-[calc(27rem+22vw)] max-w-[48rem]`로 변경 — 768px에서 약 601px,
  1439px에서 약 749px까지 뷰포트 폭에 비례해 커지도록 함.
- **세로**: 뷰포트 높이(vh) 기준 대신 "가로 계산식 × 1.2"로 고정해서, 가로:세로
  1:1.2 비율을 유지한 채 가로와 함께 커지고 줄어들게 함 (768px→601×721,
  1439px→749×899). `max-h-[85vh]`는 크기를 정하는 기준이 아니라 실제 화면보다
  커지지 않게 막는 안전판으로만 남겼다.
- pc(1440px~)의 기존 크기(1280×960, `calc(100%-1.5rem)` / `max-w-80rem`)는
  전혀 건드리지 않았다.

### 3. tab 모달 내부 레이아웃 — 스택형 vs 사이드바이사이드 전환 기준 수정

기존엔 stacked→side-by-side 전환 기준이 `tab:`(768px~)이라 tab 폭에서도 이미
사이드바이사이드로 보이고 있었다. `useBreakpoint('pc')`로 분기해서 pc(1440px~)만
사이드바이사이드, tab은 스택형이 되도록 고쳤다.

### 4. tab 모달 스크롤 인터랙션 — 고정 영역 재정의

요청에 따라 "최상위 X(닫기)"와 "최하단 좋아요·댓글·북마크 액션바"만 고정하고,
이미지→헤더→캡션→댓글까지는 하나의 스크롤 영역으로 묶었다. 기존엔 헤더와 이미지가
고정, 본문+댓글만 별도로 스크롤되는 구조였다. pc(사이드바이사이드)는 손대지
않았다 — 이미지 칼럼은 그대로 안 스크롤, 우측 칼럼은 헤더 고정 + 본문/댓글만
스크롤.

pc/tab 두 레이아웃을 CSS로만 숨기는 대신 `useBreakpoint('pc')`로 완전히 다른
트리를 렌더링하도록 분기했다 — 댓글 섹션(`CommentSection`)이 두 트리에 동시에
마운트되면 네트워크 요청과 입력창 상태가 중복될 수 있어서다.

### 5. mo 전용 상세 페이지 신설

`PostDetailContent`에 `useBreakpoint('tab')` 분기를 추가해서, mo(<768px)에서는
tab 모달과 동일한 스택 레이아웃(헤더 → 정사각 이미지 캐러셀 → 캡션 → 액션바 →
댓글)을 실제 페이지로 새로 구현했다. tab/pc에서 퍼머링크로 직접 접근했을 때
보이는 기존 게시판형 카드 레이아웃은 손대지 않고 그대로 유지했다.

### 6. 커뮤니티 피드 홈 — mo 풀블리드

mo에서만 `Container`의 좌우 여백을 제거(`px-0`)해서 피드 카드가 화면 끝까지
꽉 차게 했다(tab·pc는 `Container`의 기존 기본 여백 그대로 유지). 카드 모서리도
mo에서는 `rounded-none`, tab부터 `rounded-2xl`로 각지게/둥글게 구분했다. 이미지
영역은 기존에 이미 있던 `aspect-square` + `object-cover`로 비율이 유지되어
별도 수정은 필요 없었다.

## 변경된 파일

- `src/app/(main)/community/@modal/(.)[postId]/_ui/PostDetailModal.tsx` —
  mo 하드 리다이렉트, tab 모달 크기(가로/세로 비율 고정) 반응형화
- `src/app/(main)/community/@modal/(.)[postId]/_ui/PostDetailModalBody.tsx` —
  pc/tab 레이아웃 전환 기준 수정, tab 스크롤 영역 재구성(이미지~댓글 통합 스크롤)
- `src/app/(main)/community/[postId]/_ui/PostDetailContent.tsx` — mo 전용
  스택형 상세 페이지 분기 추가
- `src/app/(main)/community/_ui/CommunityFeedCard.tsx` — mo 카드 모서리 각지게
- `src/app/(main)/community/_ui/CommunityContent.tsx` — mo 좌우 여백 제거

이 외에 `@modal/page.tsx`, `@modal/default.tsx`, `layout.tsx`, `usePostDetail.ts`,
`CommentComposer.tsx`, `CommentItem.tsx`, `CommentSection.tsx`,
`CommunityAvatar.tsx`, `PostImageCarousel.tsx`, `mockFeed.ts`,
`communityComment.mutations.ts`는 이전 커밋("동물/아이콘 에셋 하네스 추가")에서
이미 만들어져 있던 인터셉트 라우팅/댓글 낙관적 업데이트 기반 코드이며, 이번
세션에서는 `최은진:` 주석만 추가했다(로직 변경 없음).

## 확인/검증

- 동일 오리진 iframe 하네스로 768px·1439px·1512px 뷰포트를 각각 렌더링해서
  `getBoundingClientRect()`로 모달 크기를 픽셀 단위까지 실측 확인:
  768px→601×721, 1439px→749×899, pc(1500px)→1280×960(기존과 동일, 무변화).
- mo(<768px) 실측: 댓글 아이콘 클릭 시 모달 없이 실제 페이지로 하드 네비게이션되고,
  스택 레이아웃이 정상 렌더링되는 것을 확인.
- tab 모달 스크롤 구조는 DOM 검사(`overflow-y` 스캔으로 스크롤 컨테이너가
  이미지~댓글을 전부 포함하는지 확인)와 `scrollTop` 조작으로 이미지가 스크롤되어
  나가고 X·액션바는 화면상 같은 위치에 고정되는 것을 확인.
- 매 변경마다 `tsc --noEmit`, `eslint` 통과 확인.
- 미확인: 실제 모바일 기기/터치 인터랙션(브라우저 자동화로만 검증했다). 댓글
  목록 조회 실패("댓글을 불러오지 못했습니다")는 mock 게시글에 댓글 GET이
  연결돼 있지 않은 기존 제약이며 이번 작업 범위 밖이라 손대지 않았다.

## 남은 작업 / 참고사항

- **dev 서버(Turbopack) 캐시 버그**: `@modal/(.)[postId]` 아래 파일을 반복
  수정(HMR)하면 `Invalid interception route` 에러가 누적되면서 인터셉트가
  깨지고, 모든 화면 크기에서 모달 대신 풀페이지로 넘어가는 것처럼 보일 수 있다.
  이 증상이 나오면 코드를 의심하기 전에 `rm -rf .next && pnpm dev`로 서버부터
  재시작해볼 것.
- 참고 소스: `~/Desktop/pawpong/src/components/community/FeedCard.tsx`,
  `FeedDetailModal.tsx`.
- 모든 변경 지점에 `최은진:` 주석으로 무엇을/왜 바꿨는지 남겨뒀다.
