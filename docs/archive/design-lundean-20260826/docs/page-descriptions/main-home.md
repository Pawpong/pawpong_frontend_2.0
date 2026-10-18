# 메인 홈

- 라우트: `/`
- 코드 위치: `src/app/(main)/page.tsx` + `src/widgets/{banner,hall-of-fame,adoption-showcase,community-showcase}`, `src/features/{search,category-browse}`
- 최종 갱신: 2026-08-25

## 개요

로그인 여부와 무관하게 누구나 처음 마주치는 서비스 진입 화면이다. 검색으로 바로
동물/브리더를 찾거나, 배너·카테고리·명예의 동물·분양 소식·커뮤니티 미리보기를
훑어보며 다른 주요 화면(탐색·커뮤니티·명예의 동물)으로 넘어가는 허브 역할을 한다.
자체 데이터를 깊게 다루는 화면이 아니라, 각 도메인 화면의 "쇼케이스"를 모아 보여주는
페이지다.

## 주요 기능

- 통합 검색 + 인기 검색어 노출 (`SearchSection`)
- 배너 슬라이드 열람 (`Banner`, `BannerSlide`)
- 동물 카테고리(고양이/강아지/도마뱀) 및 브리더 탐색으로 바로가기 (`CategoryBrowse`)
- 이번 주 "명예의 동물" 상위 3개 미리보기 + 상세 이미지 모달 (`HallOfFame`,
  `HallOfFamePodium`)
- 분양중인 동물 4개 미리보기 (`AdoptionShowcase`)
- 커뮤니티 최신 글 3개 미리보기 (`CommunityShowcase`)

## 화면 구성

데스크톱 기준 렌더 순서(코드 주석에 명시된 순서와 동일):

| 영역 | 설명 | 코드 위치 |
|---|---|---|
| 검색 섹션 | 검색바 + 인기 검색어 칩 | `features/search/ui/SearchSection.tsx` |
| 배너 | 슬라이드형 프로모션 배너 | `widgets/banner/ui/Banner.tsx` |
| 카테고리 브라우즈 | 브리더 CTA 스트립 + 동물 카테고리 4버튼(고양이/강아지/도마뱀/브리더 탐색) | `features/category-browse/ui/CategoryBrowse.tsx` |
| 명예의 동물 | 이번 주 상위 3마리 포디움 + "투표하기" 링크, 카드 클릭 시 이미지 상세 모달 | `widgets/hall-of-fame/ui/HallOfFame.tsx` |
| 분양중인 동물 | 분양 리스팅 4개(모바일 2열/탭·PC 4열) + "탐색 바로가기" | `widgets/adoption-showcase/ui/AdoptionShowcase.tsx` |
| 커뮤니티 미리보기 | 최신 글 3개(3번째 카드는 pc에서만 노출) + "커뮤니티 바로가기" | `widgets/community-showcase/ui/CommunityShowcase.tsx` |

## 인터랙션 · 상태

- **스크롤/고정 요소**: 이 페이지 자체엔 스크롤 기반 인터랙션 없음(sticky/fixed
  없음) — 전역 GNB만 다른 페이지와 동일하게 상단에 있음.
- **의미 있는 로컬 상태**: `selected`(`HallOfFame` 내부) — 명예의 동물 카드
  클릭 시 어떤 항목인지 저장해 `ImageDetailModal`을 여는 트리거. 그 외 섹션은
  전부 서버 데이터만으로 렌더(로컬 UI 상태 없음).

## 모션 디테일

- 배너: Swiper `autoplay`(4초 간격, `disableOnInteraction: false` — 사용자가
  조작해도 자동재생 안 꺼짐), `loop` 무한 순환. 하단 도트는 `transition-[width,
  background-color]`로 활성 도트 전환 시 애니메이션(지속시간은 Tailwind 기본값,
  코드에 별도 수치 지정 없음).
- 카테고리 버튼: hover 시 default/hover 이미지가 `transition-opacity`로 교차
  전환(지속시간 미지정, 브라우저 기본값).
- 그 외(검색·명예의 동물·쇼케이스)엔 모션 요소 없음.

## 사용자 플로우

- 검색바에서 바로 검색 → (연결 대상은 `SearchBar` 내부 구현 확인 필요, 이 문서
  갱신 시점엔 UI만 확인함)
- 카테고리 버튼 클릭 → `/explore?category=...` 또는 `/explore?type=breeder`
- 명예의 동물 카드 클릭 → 같은 페이지에서 이미지 상세 모달 오픈(`ImageDetailModal`),
  "투표하기" 클릭 → `/hall-of-fame`
- 분양 카드/`탐색 바로가기` 클릭 → `/explore`
- 커뮤니티 카드/`커뮤니티 바로가기` 클릭 → `/community` (또는 글 상세)

## 권한 · 로그인 분기

권한/로그인에 따른 분기 없음 — 로그인 여부와 무관하게 모든 사용자가 동일한
화면을 본다(검색·배너·카테고리·쇼케이스 모두 공개 콘텐츠).

## 반응형 정책

- 명예의 동물: mo/tab은 세로 스택(타이틀+CTA가 가로 한 줄, 포디움 아래), pc는
  좌측 타이틀 열 + 우측 포디움 가로 배치(`pc:flex-row`).
  Container 높이도 pc에서만 `36rem` 고정.
  포디움 아래 CTA 문구가 mo/pc는 두 줄(`block`), tab만 한 줄(`inline`)로 랩된다.
- 분양중인 동물: 카드가 mo 2열 → tab/pc 4열 그리드로 바뀐다(카드 자체 크기는
  고정 `10.25rem`, 열 수만 다름).
- 커뮤니티 미리보기: mo 1열 → tab 2열 → pc 3열(3번째 카드는 pc 전용 노출).
- 카테고리 브라우즈: 카테고리 4버튼이 mo 2×2 그리드 → tab 한 줄 flex → pc 4열
  그리드(버튼 크기도 pc에서 컨테이너에 맞춰 `aspect-[192/177]`로 반응).

## 데이터 · 상태

- 명예의 동물: `contestQueries.hallOfFame(3)` — 실패해도 `throwOnError: false`로
  던지지 않고 `MOCK_RANKING_ENTRIES`로 폴백(주석: "SSL 인증서 복구 전 홈 UI 확인용").
- 분양중인 동물: 실 API(`AdoptionPetCard`)와 카드 타입(`AdoptionListingCard`)이 아직
  안 맞아 `createMockListings()` 목업을 항상 사용 — 타입 정합 후 `adoptionQueries.list`로
  교체 예정(코드 주석 `ponytail:`).
- 커뮤니티 미리보기: `communityQueries.posts('latest', ..., 3)`,
  `throwOnError: false`. 조회 결과가 비면(로딩/실패/빈 목록 구분 없이)
  `MOCK_MY_HOME_POSTS`로 폴백하고, 이때는 좋아요/북마크 토글이 안 걸리는
  `CommunityBox`(비연결)를 쓴다 — 목업 postId가 실제로 없는 값이라 토글을 연결하면
  존재하지 않는 글에 요청이 나가기 때문(실 데이터일 때만 `ConnectedCommunityBox`).

## 엣지 케이스

| 상황 | 현재 처리 상태 |
|---|---|
| 모바일 배너 이미지 로드 실패 | 처리됨 — `onError`로 데스크톱 이미지 URL로 자동 대체(`BannerSlide`) |
| 배너 자체가 하나도 없음 | 처리됨 — 배너 섹션을 통째로 숨김(`banners.length === 0`이면 `null`) |
| 명예의 동물/분양/커뮤니티 API 실패·빈 응답 | 처리됨 — 각각 목업 데이터로 폴백(스켈레톤처럼 항상 콘텐츠가 보임) |
| 카테고리 아이콘 중 "도마뱀" 전용 아트 없음 | 미구현 — 강아지 SVG를 임시로 재사용 중, 리자드 아트 나오면 교체 필요 |

## 접근성

- 확인됨: 배너 좌우 화살표·도트(`aria-label`, 활성 도트는 `aria-current`)에
  라벨 있음. 카테고리 버튼·명예의 동물 카드도 각각 `aria-label`로 스크린리더
  안내 텍스트 있음.
- 확인 안 됨: `SearchBar`/`FavoriteAdoptionShowcaseCard` 등 하위 공용 컴포넌트
  내부의 접근성 속성은 이 문서 갱신 시점에 별도로 열어보지 않음 — 실제 확인
  필요.

## 완료 기준 체크리스트

- ☐ mo/tab/pc 3개 폭에서 모든 섹션 그리드 열 수가 의도대로 바뀐다 (필수)
- ☐ 배너 자동재생이 4초 간격으로 돌고, 좌우 화살표/도트로 수동 이동도 된다 (필수)
- ☐ 명예의 동물/분양/커뮤니티 API가 실패해도 빈 화면이 아니라 목업으로 채워진다 (필수)
- ☐ 모바일 배너 이미지가 깨져도 데스크톱 이미지로 자연스럽게 대체된다 (확인 필요)
- ☐ 카테고리 4버튼이 키보드(Tab)만으로 전부 접근·클릭된다 (확인 필요)

## 연관 화면

- `/explore` (탐색 — 카테고리 버튼, 분양 쇼케이스)
- `/explore?type=breeder` (브리더 탐색 — 카테고리의 "브리더 탐색" 버튼)
- `/hall-of-fame` (명예의 동물 투표 페이지)
- `/community` (커뮤니티 쇼케이스)

## 참고

- 인기 검색어 목록은 API 연결 전 하드코딩 샘플(`POPULAR_KEYWORDS`, Figma
  2752-261253).
- 브리더 CTA 스트립·카테고리 버튼 관련 Figma 참조: 2752-266393(발자국),
  2752-266432(CTA 밴드), 2752-269487(카테고리 버튼), 2752-269648(카테고리 밴드).
- 카테고리 버튼 중 "도마뱀 찾기"는 전용 아트가 없어 강아지 SVG를 임시로 쓰고 있음
  (`ponytail:` 주석 — 리자드 SVG 나오면 교체 필요).
