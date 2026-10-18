# 탐색 (입양 탐색 / 브리더 탐색)

- 라우트: `/explore` (`?type=breeder`로 브리더 탐색 전환, `?category=`로 동물 카테고리 필터)
- 코드 위치: `src/app/(main)/explore/`
- 최종 갱신: 2026-08-25

## 개요

분양 동물을 찾는 사람과 브리더를 찾는 사람이 한 라우트에서 탭 전환만으로 오가는
탐색 화면이다. 상단 탭(`TabBar`)으로 "입양 탐색"/"브리더 탐색"을 고르고, 카테고리
칩과 검색으로 좁힌 뒤 무한스크롤 목록을 본다. 메인 홈의 카테고리 버튼·쇼케이스가
전부 이 화면으로 연결된다.

## 주요 기능

- 입양 탐색 ↔ 브리더 탐색 탭 전환 (`TabBar`, `EXPLORE_TABS`)
- 동물 카테고리 칩 필터(고양이/강아지/도마뱀 등, `CategorySection`)
- 통합 검색바(탭별로 placeholder 다름, `SEARCH_PLACEHOLDERS`)
- 입양 탐색 전용: 정렬/상태 필터 칩(전체·분양중·인기) + 무한스크롤 카드 그리드
- 브리더 탐색 전용: 인기 브리더 섹션 + 전체 브리더 소식 섹션
- 스크롤 시 상단 카테고리+검색 영역이 사라지면, GNB(+tab 탭바) 아래 고정되는
  컴팩트 필터바로 전환(`ExploreFilterBar`) — 레이아웃 점프 없이 `fixed`로 노출

## 화면 구성

렌더 순서(입양 탐색 기준):

| 영역 | 설명 | 코드 위치 |
|---|---|---|
| 탭 바 | 입양 탐색/브리더 탐색 전환, tab+에서 상단 고정(sticky) | `_ui/ExploreContent.tsx` (`TabBar`) |
| 컴팩트 필터바(스크롤 시) | 카테고리 칩 + 검색 버튼, GNB/탭바 아래 fixed로만 노출 | `_ui/ExploreFilterBar.tsx` |
| 카테고리 섹션 | 픽셀 카테고리 버튼(모바일 2×2 / tab+ 4열 가운데) | `features/category-filter` (`CategorySection`) |
| 검색바 | 홈과 동일 컴포넌트, 탭별 placeholder만 다름 | `features/search/ui/SearchSection.tsx` |
| (입양) 전체 분양 소식 | 정렬/상태 필터 칩 + 카드 그리드 + 무한스크롤 | `_ui/ExploreContent.tsx`, `features/adoption` (`AdoptionCardGrid`) |
| (브리더) 인기 브리더 | 인기 브리더 가로 스크롤/그리드(뱃지 표시) | `_ui/BreederExploreContent.tsx`, `_ui/ExploreListingSection.tsx` |
| (브리더) 전체 브리더 소식 | 전체 브리더 카드 그리드 | `_ui/BreederExploreContent.tsx` |

## 인터랙션 · 상태

- **스크롤/고정 요소**: 이 페이지에서 가장 복잡한 부분.
  - 탭 바(`TabBar`): tab+에서 `top: gnbH`로 sticky.
  - 상단 카테고리+검색 영역이 스크롤로 화면 밖을 벗어나면(`sentinelRef`를
    `IntersectionObserver`로 감시), 그 자리를 대신할 컴팩트 필터바
    (`ExploreFilterBar`)가 `fixed`로 나타난다 — 레이아웃 점프 없이 자리만 대체.
  - 컴팩트바의 `top` 오프셋은 `gnbH + (tab+ ? headerH : 0)`로 계산 — `headerH`는
    탭바 실측 높이를 `ResizeObserver`로 상시 추적(폰트 로드·HMR로 높이가
    바뀌어도 stale 되지 않게).
- **의미 있는 로컬 상태**:
  - `selectedType`(`adoption`/`breeder`, URL 쿼리 `type`과 동기화) — 탭 전체 전환.
  - `selectedCategory`(URL 쿼리 `category`) — 동물 카테고리 필터.
  - `adoptionListFilter`(전체/분양중/인기, 입양 탭 전용 로컬 state) — URL에는
    안 실리고 새로고침하면 초기화됨.
  - `isStuck` — 컴팩트 필터바 노출 여부.
  - `searchExpanded`(`ExploreFilterBar` 내부) — 카테고리 칩 ↔ 전체폭 검색바 토글.

## 모션 디테일

grep 기준으로 `transition`/`duration` 클래스가 이 페이지 코드 자체엔 없음 —
탭 전환·컴팩트 필터바 등장은 전부 `hidden`/`block` 즉시 토글이거나 `fixed` 위치
자체가 바뀌는 방식이지 애니메이션은 아니다. **모션 요소 없음**(컴팩트바가
"슥" 나타나는 느낌을 의도했다면 현재 코드엔 반영 안 돼 있음).

## 사용자 플로우

- 메인 홈 카테고리 버튼/쇼케이스 → `/explore?category=...` 또는
  `/explore?type=breeder`로 진입(쿼리 파라미터로 탭·카테고리 상태 복원)
- 탭/카테고리 변경은 `router.replace`로 URL 쿼리만 갱신(`scroll: false`, 스크롤
  위치 유지) — 뒤로가기 시에도 필터 상태가 URL에 남는다
- 카드 클릭 → 각 도메인 상세 페이지(분양 상세/브리더 홈)로 이동
- 컴팩트 필터바에서 "검색" 클릭 → 같은 자리에서 전체 폭 입력창으로 확장

## 권한 · 로그인 분기

권한/로그인에 따른 분기 없음 — 로그인 여부와 무관하게 동일한 화면(찜/즐겨찾기
버튼이 로그인 여부에 따라 다르게 동작할 가능성은 있으나, 이 페이지 코드
자체에는 로그인 체크가 보이지 않음 — 카드 컴포넌트 내부 확인 필요).

## 반응형 정책

- 탭 바: tab+에서만 상단 고정(sticky), mo는 비고정 — GNB만 sticky.
- 스크롤 고정 컴팩트 필터바: tab+는 `gnbH + 탭바 높이`, mo는 `gnbH`만큼 아래에
  고정(모바일은 탭바 자체가 스크롤로 사라지므로).
- `ExploreFilterBar` 검색: 카테고리 칩+작은 검색 버튼 ↔ 필터 버튼+전체폭 입력창,
  두 상태를 토글(모바일·태블릿 동일 로직).
- 입양 카드 그리드/브리더 리스트는 각 도메인 카드 컴포넌트(`AdoptionCardGrid`,
  `ExploreListingSection`)가 자체적으로 열 수를 반응형 처리.

## 데이터 · 상태

- 입양 탐색: `adoptionQueries.list(sort, petType, status)` — 카테고리 칩은
  `petType`, 필터 칩(전체/분양중/인기)은 `sort`/`status`로 서버 쿼리 파라미터에
  매핑(클라이언트 slice 금지). `selectedType === 'adoption'`일 때만 `enabled`.
  무한스크롤 페이지 병합 시 `listingId` 기준 `dedupeBy`로 중복 제거(서버
  페이지네이션 경계 중복 방어).
- 브리더 탐색: 현재 `MOCK_FEATURED_BREEDERS`/`MOCK_EXPLORE_BREEDERS` 목업 고정
  (실 API 미연결).
- 로딩/에러/빈 상태: `ListState`(공통 컴포넌트)로 분기 — "분양글을 불러오는
  중입니다."/"분양글을 불러오지 못했습니다."/"등록된 분양글이 없습니다."

## 엣지 케이스

| 상황 | 현재 처리 상태 |
|---|---|
| URL `category` 쿼리에 유효하지 않은 값이 들어옴(직접 주소 조작 등) | 처리됨 — `ANIMAL_CATEGORIES.includes` 검증 후 `'all'`로 폴백 |
| 입양 목록 API 실패·빈 목록 | 처리됨 — `ListState`로 에러/빈 문구 노출 |
| 브리더 탐색 API 실패 | 미구현/해당 없음 — 현재 목업 고정이라 실패 상태 자체가 존재하지 않음(실 API 연결 시 별도 처리 필요) |
| 무한스크롤 페이지 경계에서 항목 중복 | 처리됨 — `listingId` 기준 `dedupeBy`로 중복 제거 |

## 접근성

- 확인됨: 탭 바(`ariaLabel="탐색 유형"`), 분양 소식 필터 그룹(`aria-label="분양
  소식 필터"`)에 라벨 있음.
- 확인 안 됨: 카테고리 칩(`FilterChip`)·검색 버튼·`ExploreFilterBar`의 검색/필터
  토글 버튼에 `aria-label`이 있는지는 이 문서 갱신 시점에 확인 안 됨 — 아이콘만
  있고 텍스트가 없는 버튼(`SearchIcon`만 있는 경우)이라면 라벨이 필요할 수
  있음.

## 완료 기준 체크리스트

- ☐ 탭 전환·카테고리 변경 후 새로고침해도 URL 기준으로 같은 상태가 복원된다 (필수)
- ☐ 스크롤해서 상단 영역이 사라지면 컴팩트 필터바가 레이아웃 점프 없이 나타난다 (필수)
- ☐ `category` URL 값을 임의로 이상하게 바꿔도 화면이 깨지지 않고 "전체"로 처리된다 (필수)
- ☐ 카테고리 칩·검색 버튼이 키보드(Tab)만으로 접근 가능한지 확인 (확인 필요)
- ☐ 브리더 탐색 실 API 연결 시 에러/빈 상태 UI 추가 필요 (확인 필요)

## 연관 화면

- 분양 카드 클릭 → 분양 상세(`/adoption/[id]`)
- 브리더 카드 클릭 → 브리더 홈(`/home/[userId]`, `BreederCard` 경유)
- 메인 홈 카테고리 버튼·쇼케이스가 이 화면으로 진입시킴

## 참고

- Figma 참조: 필터바 1652-75035 / 1652-81824(레이아웃), 1652-81786(칩/뱃지).
- `ExploreContent`는 `useSearchParams`를 쓰므로 `page.tsx`에서 `Suspense`로 감싸야
  프리렌더가 CSR bailout 에러 없이 통과한다 — 새 하위 라우트를 추가할 때 유의.
- 입양 카드 API 응답 타입(`AdoptionPetCard`)과 프런트 카드 타입
  (`AdoptionListingCard`)이 아직 안 맞아 홈 쇼케이스·탐색 둘 다 부분적으로 목업을
  섞어 쓰고 있음(`ponytail:` 주석) — 타입 정합이 남은 작업.
