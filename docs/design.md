# Pawpong UI 설계 기준

이 문서는 Pawpong 웹 프론트엔드의 디자인 구현 기준점이다. 화면의 큰 UX와 정보 구조는 이미 정의되어 있으므로, 새 흐름을 임의로 만들기보다 Figma와 기존 공용 컴포넌트를 조합해 일관되게 구현한다.

## 1. 기준의 우선순위

1. Figma `2026-pawpong`의 해당 화면·컴포넌트 노드
2. 이 문서의 토큰·반응형·상태 규칙
3. `src/shared/ui`의 공용 컴포넌트 계약
4. 페이지별 구현

서로 어긋날 때는 Figma의 시각 의도와 접근성·실제 데이터 상태를 함께 만족하는 방향으로 공용 컴포넌트를 먼저 수정한다. 같은 의미의 UI를 페이지마다 새로 만들지 않는다.

## 2. Figma 출처

- 파일: [2026-pawpong](https://www.figma.com/design/7VXGIjqr1eZBEmsp3OPNie/2026-pawpong)
- 홈 전체 및 반응형: PC `3349:2252855`, Tablet `4042:800891`, Mobile `4042:800892`
- PC 헤더: `3349:1763537`
- 하단 내비게이션: `4042:780810`
- 홈 분양 카드: Mobile `3349:1763378`, PC `3406:724284`
- 홈 카테고리: Mobile `3349:1763363`, PC `3406:733504`
- 프로필 카드: `1021:20324`
- 공용 탭 바: `976:32388`
- 커뮤니티 메인(피드): PC `1440 · 커뮤니티 홈`
- 커뮤니티 작성 폼: `1056:46147`
- 전체 메뉴·FAQ·설정: 독립 Figma 화면이 확인되지 않아 홈 PC `3349:2252855`, PC 헤더 `3349:1763537`, 공용 탭 `976:32388`의 셸·표면·타이포 계층을 조합한다.
- 폐기된 브리더 등급 정책 화면: 과거 전체 메뉴 Mobile `3555:416834`, Tablet `3555:414100`, PC `3547:605288`의 `등급 정책` 항목은 아카이브 참고 자료다. 현행 메뉴·라우트에는 연결하지 않는다.

Figma에 특정 화면이 없으면 가장 가까운 기존 화면의 `페이지 셸 → 헤더 → 섹션 → 목록/카드 → 액션` 계층을 재사용한다. 알림처럼 별도 화면 원본이 없는 기능은 홈·저장목록·커뮤니티의 리스트 패턴을 조합한다.

## 3. 핵심 원칙

- 기존 IA, 진입점, 액션 위치를 유지한다. 디자인 정리는 기능 흐름을 바꾸는 작업이 아니다.
- 색·간격·타이포는 의미 기반 토큰을 사용하고 임의 hex·임의 shadow를 추가하지 않는다.
- 한 의미에는 한 공용 컴포넌트를 사용한다. 페이지별 복제 컴포넌트보다 variant를 확장한다.
- 실 API의 로딩·오류·빈 상태를 정상 화면과 같은 수준으로 설계한다.
- hover는 콘텐츠의 위치를 흔들거나 카드 행 기준선을 바꾸지 않는다. 얕은 그림자와 이미지 내부의 최대 1.02배 확대만 사용하며 카드 자체의 translate/scale이나 회색 덮개는 적용하지 않는다.
- 파괴적 액션은 아이콘/메뉴 진입 후 확인 모달을 사용한다. 목록에 작은 빨간 텍스트 링크를 반복하지 않는다.
- 모바일 우선으로 작성하고 `tab:`과 `pc:`에서 필요한 속성만 확장한다.

## 4. 반응형 시스템

Figma의 명시 구간을 CSS와 JS에서 동일하게 사용한다.

| 구간   |          폭 |                  대표 검증 폭 | 구현                       |
| ------ | ----------: | ----------------------------: | -------------------------- |
| Mobile |     0~767px |                  375px, 767px | 기본 클래스, Figma `375/*` |
| Tablet |  768~1439px | 768px, 1024px, 1280px, 1439px | `tab:`                     |
| PC     | 1440px 이상 |                1440px, 1920px | `pc:`                      |

- Tailwind: `src/app/globals.css`의 `--breakpoint-tab: 768px`, `--breakpoint-pc: 1440px`
- JS: `src/shared/lib/useBreakpoint.ts`의 `BREAKPOINTS`와 반드시 같은 값을 유지한다.
- CSS로 표현 가능한 레이아웃은 `useBreakpoint` 대신 반응형 클래스를 사용한다. JS 분기는 렌더링 콘텐츠나 동작 자체가 달라질 때만 쓴다.
- 임의 `min-[1440px]`는 쓰지 않고 `pc:`를 사용한다. 새 예외 브레이크포인트를 추가하려면 이 문서에 이유와 영향 범위를 먼저 기록한다.
- 브라우저 폭 경계 테스트는 767↔768, 1439↔1440 양쪽을 모두 확인한다.

### 페이지 셸과 거터

- 전체 배경/밴드 셸 상한: `PAGE_WIDTH_CLASS = mx-auto w-full max-w-[90rem]` (1440px)
- 콘텐츠 셸: `RESPONSIVE_SHELL_CLASS = 704px → 1376px → 1440px`. 각 구간의 기본 거터를 뺀 실제 폭이 672px → 최대 1280px → 1280px으로 이어진다.
- 기본 `Container`: mobile 20px / tablet 48px / PC 80px
- 홈 쇼케이스·탭·내비게이션처럼 Figma가 16px을 명시한 mobile 영역은 `px-4`로 덮는다.
- 공용 `Container`는 Mobile에서 바깥 704px, Tablet에서 바깥 1376px을 상한으로 둔다. 16px 여백 화면은 Mobile 실내용 672px, 기본 20px 여백 화면은 664px이 되며, Tablet은 48px 여백을 빼 최대 1280px이다. PC의 80px 여백·1280px 실내용 폭으로 넘어갈 때도 역축소하지 않는다.
- PC 1440 프레임의 주 콘텐츠 폭은 좌우 80px을 뺀 1280px을 기본으로 한다.
- 넓은 화면에서 콘텐츠 폭은 늘리지 않고 1440px 셸을 가운데 정렬한다.

### 반응형 변경 규칙

- Mobile: 한 열 또는 2열 카드, 하단 내비게이션, 터치 대상 최소 40px.
- Tablet: 정보 밀도를 높이되 PC 전용 좌우 분할을 미리 켜지 않는다.
- PC: 1440px부터 GNB·좌우 분할·4열 카드·hover affordance를 활성화한다.
- 작성 폼처럼 Figma가 Tablet 프레임 상한을 명시한 화면은 768~1439px에서 실내용 폭 672px을 유지하고, 1440px부터 PC 1280px 분할 레이아웃으로 전환한다.
- 고정 variant가 있는 카드는 기준 폭 사이에서 무한히 늘리지 않는다. 분양·브리더 카드는 164px에서 282px, 커뮤니티 카드는 321px에서 407px까지만 허용한다.
- `ListingCardGrid`의 탐색형은 Mobile~Tablet에서 최대 282px 2열, PC에서 282px 4열로 전환한다. 브리더 compact형은 Mobile 164px 2열, Tablet 최대 282px 3열, PC 282px 4열로 제한해 1439→1440px에서 카드 폭이 역전되지 않게 한다.
- 커뮤니티 메인 피드의 `CommunityFeedCard`는 Figma `3606:622637` 기준 16px radius를 유지하고, 폭 상한은 Mobile/Tablet 343px · PC 415px로 둔다. Tablet 여백을 채우기 위해 1:1 미디어를 확대하지 않는다.
- 커뮤니티 메인 피드의 표면은 Figma PC `1440 · 커뮤니티 홈`대로 흰 배경이다. 중립 회색 표면을 페이지 셸 폭 전체에 깔지 않는다 — 컬럼이 343~415px이라 PC에서 좌우에 빈 회색 띠만 남는다.
- 커뮤니티 메인의 `NavigationBar`(포퐁커뮤니티)는 PC 시안에 없다. `pc:hidden`으로 두고 GNB의 `커뮤니티` 탭이 그 역할을 한다.
- 프로필·단일 컬럼 피드는 Mobile/Tablet에서 실내용 672px, PC에서 Figma `1021:20324`의 948px을 상한으로 한다. 공용 탭 셸은 Mobile 바깥 704px/실내용 672px, Tablet 바깥 768px/실내용 672px, PC에서 Figma `976:32388`의 바깥 940px/실내용 780px을 상한으로 하며 sticky 표면만 페이지 폭을 채운다.
- 채팅 목록·대화·입력도 같은 Mobile 704px 상한을 공유한다. PC 사이드바 내부는 독립 폭이므로 해당 상한을 적용하지 않는다.
- GNB와 서브 내비게이션도 `RESPONSIVE_SHELL_CLASS`를 사용한다. 배경은 viewport 너비를 유지하고 로고·제목·액션만 경계에서 같은 실내용 폭으로 이어진다.
- 767↔768에서 카드 크기가 역전되지 않도록 Mobile 그리드는 Figma 375 폭을 상한으로 가운데 정렬하고, Tablet부터 PC 상한까지 필요한 경우 `clamp()`로 보간한다.
- 이미지 비율은 각 엔티티 카드가 소유하고, 그리드는 열 수와 gap만 소유한다.
- 텍스트 줄 수가 달라져도 같은 그리드 행의 카드 외곽 크기가 갑자기 변하지 않게 line-clamp와 최소 높이를 사용한다.

## 5. 디자인 토큰

토큰의 실제 값은 `src/app/globals.css`가 단일 구현 원본이다.

### 색상 역할

| 역할            | 토큰                         | 용도                                   |
| --------------- | ---------------------------- | -------------------------------------- |
| Brand primary   | `primary-500` (`#ad651d`)    | 활성 내비게이션, 링크 강조, focus ring |
| Brand secondary | `secondary-500` (`#f6c65d`)  | 보조 브랜드 장식                       |
| Point CTA       | `point-500` (`#fffe72`)      | 주 CTA 버튼 배경                       |
| Warm surface    | `primary-50`, `point-50`     | 선택·읽지 않음·부드러운 hover 배경     |
| Primary text    | `neutral-850`                | 제목·주요 본문                         |
| Secondary text  | `neutral-700`                | 설명·메타 정보                         |
| Muted text      | `neutral-500`                | 날짜·보조 정보                         |
| Border          | `neutral-150`, `neutral-300` | 카드·섹션·입력 경계                    |
| Error           | `error-500/600`              | 파괴적 액션·오류 메시지                |
| Info            | `info-500`                   | 정보 상태와 Figma 폼 focus/open 경계선 |

- 공용 컴포넌트에서는 Tailwind 기본 `zinc`, `slate`, `gray`, `red` 팔레트와 `dark:` 변형을 쓰지 않는다. Pawpong semantic token으로 의미를 표현한다.
- Figma 자산·소셜 브랜드·픽셀 메달처럼 고유색 자체가 의미인 경우에만 hex를 허용하고 코드 주석에 출처를 남긴다.

### 타이포그래피

- 본문: Pretendard, line-height 150%.
- 브랜드/섹션 제목: Cafe24 Proup. 일반 본문에 남용하지 않는다.
- 최소 본문 크기: 12px은 날짜·카운터 등 보조 정보에만 사용한다.
- 반응형 본문 토큰 `text-body-s`: mobile 14px, tablet 이상 16px.
- 숫자·상태·버튼 레이블은 시각 크기뿐 아니라 font weight까지 공용 컴포넌트에서 결정한다.

### 모서리·그림자·모션

- 입력/작은 컨트롤: `rounded-lg`.
- 콘텐츠 카드: Figma에 따라 `rounded-lg` 또는 `rounded-xl`; 한 목록 안에서 혼용 금지.
- 알약형 CTA/필터: `rounded-full`.
- 공용 떠 있는 레이어 그림자: `0 7px 7px rgba(55,55,55,.1)` 계열.
- 전환은 색·그림자·opacity 150~200ms를 기본으로 한다.
- `prefers-reduced-motion` 환경에서도 상태가 색·텍스트로 구분되어야 한다.

## 6. 레이아웃 컴포넌트

| 컴포넌트          | 계약                                                                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Container`       | 1440px 셸과 기본 반응형 거터를 제공한다. 페이지마다 새 max-width 래퍼를 만들기 전에 사용한다.                                                                               |
| `NavigationBar`   | 모바일/상세 화면의 뒤로가기·닫기·제목을 담당한다.                                                                                                                           |
| `PageHeader`      | 독립 페이지의 뒤로가기와 중앙 제목을 담당한다.                                                                                                                              |
| `SectionHeader`   | 섹션 제목·설명·상세 링크를 정렬한다.                                                                                                                                        |
| `ShowcaseSection` | 홈 섹션의 거터·수직 간격·헤더를 함께 제공한다.                                                                                                                              |
| `BottomNav`       | Mobile·Tablet의 56px 주요 내비게이션. 최상위 화면에서만 표시하고 자체 하단 CTA 화면에서는 숨긴다. 서버 스트리밍 중에도 홈 계열 fallback을 즉시 표시해 본문과 겹치지 않는다. |
| `TabBar`, `Tabs`  | Figma `976:32388`의 탭 높이·indicator·페이지 폭을 제공한다.                                                                                                                 |
| `ListingCardGrid` | 탐색/홈 카드 열과 gap을 제공한다. 카드 외형을 소유하지 않는다.                                                                                                              |
| `FooterCtaBar`    | 작성·신청 화면의 고정/하단 CTA 정렬을 제공한다.                                                                                                                             |
| `MobileMenu`      | 전 구간 전체 메뉴를 modal dialog로 제공한다. 서비스 링크는 항상, 계정 링크는 로그인 상태에서만 노출하며 ESC·focus trap·이동 후 닫힘을 보장한다.                             |
| `SiteFooter`      | 공개 탐색 화면의 서비스 메뉴·현재 공개 사업자 정보·약관 링크를 제공한다. 계정·작성·채팅 같은 집중 흐름에는 렌더하지 않는다.                                                 |
| `FullPageMessage` | 404·전역 오류처럼 전체 페이지를 대신하는 상태의 브랜드 표면·타이포·액션 정렬을 제공한다.                                                                                    |

## 7. 공용 컴포넌트 카탈로그

### 액션·선택

- `Button`: primary, outline, text, fill, ghost. 새 CTA는 이 variant를 우선 확장한다.
- `FavoriteButton`, `FavoriteToggle`, `FollowButton`, `PostActionButton`: 도메인 액션의 아이콘·레이블·pending 상태를 소유한다.
- 입양 관심 액션은 일반 방문자에게 Mobile CTA / Tablet 히어로 / PC 히어로 중 정확히 한 곳만 노출한다. 소유자 본인의 분양글에는 노출하지 않으며, 서버도 동일 소유자 등록을 403으로 차단해 인기 정렬 지표를 보호한다.
- `FilterChip`, `Badge`, `PixelTab`, `PixelSelectCard`: 선택·분류·상태 표시에 사용한다.
- `Checkbox`, `Switch`, `Select`, `Dropdown`, `DropdownMenu`: 폼 선택과 메뉴를 담당한다.
- `Switch`, `Select`, `Checkbox`, `DropdownMenu`는 `neutral` 표면, `primary-500` focus ring, `point-500` 선택 상태, `error-*` 파괴 상태를 공유한다.
- `OwnerActionsMenu`: 수정·삭제 같은 소유자 액션을 한 메뉴로 모은다.
- `ReportPostAction`: 남의 커뮤니티 글 `⋮` 메뉴, 로그인 안내, 신고 사유·상세 입력, 접수 결과를 하나의 기능 흐름으로 소유한다. 엔티티 카드는 `moreAction` 슬롯만 제공한다.
- `ChatRoomActionsMenu`: 목록·대화 헤더의 동일한 `⋮` 진입점에서 채팅방 나가기 확인과 pending/error 상태를 소유한다.
- `ChatAttachMenu`: 이미지·파일·위치 첨부의 단일 진입점이다. 위치 공유는 disabled placeholder를 두지 않고 명시적 동의 모달, 브라우저 권한 요청, 로컬 오류 복구까지 한 흐름으로 제공한다.

### 입력·검색

- `Input`, `InputField`: 입력, 레이블, 도움말, 오류 상태를 결합한다. Figma의 폼 focus/open 경계선은 `info-500`을 쓰되 CTA·내비게이션·focus-visible ring의 브랜드 강조는 `primary-500`을 쓴다.
- `InputUpload`: 글·분양글 작성 진입을 흰 표면 안의 보조 맥락과 `point-500` 액션으로 묶는다. 맥락 없이 포인트 알약 버튼만 콘텐츠 위에 띄우지 않는다.
- `Textarea`, `TextareaField`: 장문 입력과 글자 수/오류 상태를 담당한다.
- `SearchBar`, `SearchButton`, `SearchIcon`: 높이 40px, radius 8, neutral border의 검색 submit을 공통화한다. 홈 검색 폭은 Mobile 343px / Tablet 482px / PC 846px이다.
- `Label`, `TextLabel`, `HelpMessage`: 필드 레이블·필수/선택·도움말에 사용한다.
- `DocumentFilePicker`: 온보딩과 등급 심사에서 같은 서류 선택 표면·파일명·오류 상태를 제공한다. PDF·JPG·PNG·WEBP만 허용하고 파일당 최대 20MB이며, 서버도 MIME·확장자·크기와 업로드 소유권을 다시 검증한다.

### 홈 반응형 기준

| 영역            |      Mobile 375 |                        Tablet 768 |                    PC 1440 |
| --------------- | --------------: | --------------------------------: | -------------------------: |
| 검색 레이아웃   | 95px / 폭 343px |                  116px / 폭 482px |           116px / 폭 846px |
| 배너            |      375×191.67 | 활성 604.8×241.07 / 섹션 259.73px | 활성 1134×452 / 섹션 487px |
| 카테고리        | 2×2, 섹션 225px |           4개 한 줄, 섹션 124.5px |   4개 한 줄, 섹션 187.39px |
| 분양 카드       | 164×195.84, 2×2 |                   164×195.84, 4열 |               282×303, 4열 |
| 커뮤니티 카드   |    321×326, 1열 |                      321×326, 2열 |               407×376, 3열 |
| 하단 내비게이션 |            56px |                              56px |                       숨김 |

- 배너 비활성 슬라이드는 활성 크기의 `974 / 1134`(약 85.9%)로 축소하고 opacity 30%를 적용한다. 논리 gap을 추가하지 않아 축소 여백 자체가 Tablet 약 42.7px / PC 80px 간격이 되게 한다.
- 배너가 2~3개뿐이면 원본 목록을 3회 배치해 Swiper `loop`가 요구하는 슬라이드 수를 확보한다. 가운데 완충 구간에서 시작하고 페이지네이션은 원본 배너 수만 노출해, 경고·활성 클래스 이탈 없이 이전/다음·자동재생·스와이프를 순환한다.
- 홈 섹션 외곽 여백은 Mobile 16px / Tablet 48px / PC 80px이며, 분양·커뮤니티 헤더와 카드 사이 간격은 12px이다.

### 데이터 표현

- `MediaCard`: 이미지 카드의 이미지·본문·메타 슬롯을 제공한다. 이미지 상세 링크와 즐겨찾기 버튼을 중첩하지 않으며, 이미지 누락·로드 실패 시 `point-50`과 paw 글리프 폴백으로 비율을 유지한다.
- `ProfileAvatar`, `ProfileHeader`, `AuthorInfo`, `Avatar`, `AvatarGroup`: 프로필 이미지 fallback과 이름·등급 정렬을 통일한다.
- `ListingStats`, `ListingCardGrid`, `PostedDate`, `DetailLink`: 목록 메타와 이동 affordance를 제공한다.
- `ImageCarousel`, `ImageModal`, `ImageDetailModal`: 이미지 탐색·확대·상세 모달을 담당한다.
- `Pagination`, `InfiniteScrollTrigger`: 페이지/무한 목록의 추가 로딩을 담당한다.

### 상태·피드백

- `AsyncState`: 상세·폼·프로필처럼 목록이 아닌 화면의 loading/error/empty 상태와 재시도 액션을 같은 높이·타이포로 제공한다.
- `ListState`: pending → error → empty → content 우선순위를 공통 처리하고, 오류 상태의 `errorAction`으로 같은 자리에서 재시도를 제공한다.
- `AlertMessage`, `ErrorBoundaryUI`: 인라인 안내와 복구 가능한 화면 오류에 사용한다.
- 로딩은 레이아웃을 유지하고, 오류에는 재시도 또는 안전한 이전 경로를 제공한다.
- 빈 상태는 “데이터가 없음”과 “기능이 비활성”을 구분해 문구와 CTA를 결정한다.
- API 오류는 전역 React error boundary로 화면 전체를 교체하지 않는다. 해당 화면의 `AsyncState`/`ListState`에서 복구하고, 전역 boundary는 렌더링·프로그래밍 오류에만 사용한다.

### 오버레이·확인

- `Dialog`, `CtaModal`, `BottomSheet`, `PolicyModal`, `ShareModal`, `FollowersModal`: 목적에 맞는 공용 overlay를 사용한다.
- `DeleteConfirmModal`: 삭제 전 확인이 필요한 모든 파괴적 액션의 기본 진입점이다.
- `ExitConfirmModal`, `LoginPromptModal`: 작성 이탈과 인증 필요 흐름을 담당한다.
- 신고는 임의 기본 사유를 전송하지 않는다. 사용자가 백엔드 enum에 대응하는 사유를 명시적으로 선택해야 하며, 선택 전에는 클라이언트 검증으로 요청을 차단한다.
- 비로그인 신고는 401 요청을 먼저 보내지 않고 `LoginPromptModal`에서 현재 경로를 returnUrl로 보존한다.
- 채팅방 나가기는 목록과 대화 헤더에서 같은 확인 문구를 사용한다. 성공하면 닫힌 방을 목록·메시지 캐시에서 즉시 제거하고, 보고 있던 방이면 `/chat`으로 replace해 닫힌 딥링크가 뒤로가기 기록에 남지 않게 한다.
- 채팅 위치 공유는 전송 전에 상대에게 현재 좌표가 공개됨을 고지한다. 한 번의 좌표와 정확도만 메시지에 저장하고 이동 경로·주소를 수집하지 않으며, 권한 거부·위치 확인 불가·시간 초과를 모달 내부 오류로 복구한다.
- 위치 메시지는 `location` 타입과 범위 검증된 위도·경도를 사용한다. 말풍선은 기존 point/white 표면을 유지하고 외부 지도는 새 탭에서 열며, 원 좌표를 임의 주소로 역지오코딩하지 않는다.
- 닫기 아이콘, focus trap, ESC, overlay click 동작은 각 페이지가 재구현하지 않는다.
- 전체 메뉴는 Radix `Dialog`를 사용한다. viewport 전체에 neutral/warm surface를 깔고 내부 콘텐츠는 `RESPONSIVE_SHELL_CLASS`와 16/48/80px 거터를 그대로 따른다.

### 계정·도움말 화면

- `/settings`는 인증된 사용자의 계정 허브다. 프로필·알림·저장목록을 공통으로 제공하고, 브리더에게만 분양글 관리를 추가한다.
- 입양자 설정과 전체 메뉴에는 `/activity`의 `신청·후기 내역` 진입점을 제공한다. 브리더에게는 노출하지 않으며 서버 역할 가드로 직접 접근도 차단한다.
- `/activity`는 신청 내역과 내 후기를 공용 `TabBar`로 나눈다. 목록은 화면마다 분리된 카드가 아니라 `rounded-xl + neutral-150 border + white surface` 패널 안의 구분 행으로 표시해 설정·알림과 같은 계정 화면 계층을 유지한다.
- 신청 목록·상세의 `reviewId`가 서버 상태의 기준이다. 프론트가 후기 전체 목록을 다시 훑어 작성 여부를 추측하지 않으며, 후기 작성 후 신청·후기 캐시를 함께 무효화한다.
- 후기는 신청 한 건당 한 건만 작성한다. `consultation_completed`는 상담 후기, `adoption_approved`는 입양 후기만 허용하고 그 외 상태에서는 작성 폼을 노출하지 않는다.
- 신청·후기 전용 Figma 원본은 아직 없다. 홈 셸 `3349:1763114`, 공용 탭 `976:32388`, 설정 계정 패널의 표면·타이포·거터를 조합한 현재 화면을 정책 기준으로 사용하며 별도 Figma가 생기면 실측값만 교체한다.
- `/faq`는 공개 화면이며 입양자/브리더 탭마다 `GET /home/faqs?userType=...`의 실제 데이터를 표시한다.
- FAQ 항목은 별도 JavaScript accordion을 복제하지 않고 native `details/summary`를 사용한다. 질문 행 전체가 터치·키보드 대상이며 열림 상태는 화살표 회전과 답변 표면으로 함께 표시한다.
- FAQ 문구는 현재 구현된 서비스 진입점과 API 상태만 안내한다. 검증을 건강·결과 보증으로 표현하거나 미구현 고객센터·결제·배송 정책을 약속하지 않는다.
- 파충류 FAQ는 종별 사육 조건 차이를 전제로 하며 획일적인 온습도·UVB·급여 수치를 제시하지 않는다. 위생과 건강 안내는 공신력 있는 수의학·공중보건 자료를 근거로 하고 전문 수의사 상담의 경계를 명시한다.
- 명예의 전당 참여작은 Figma 홈의 `point-100` 시상대 표면을 유지한다. 과거 데이터의 외부 이미지가 만료되거나 로딩에 실패하면 브라우저의 깨진 이미지 아이콘을 노출하지 않고 `point-100 + primary-300 PawIcon` 폴백으로 교체한다.
- 계정 메뉴와 도움말 목록은 `rounded-xl + neutral-150 border + white surface`를 공통 카드 계약으로 사용하고, 작은 텍스트 링크를 흩뿌리지 않는다.
- 2026-08-31 확정 정책에는 New/Elite 브리더 등급제가 없다. 카드·프로필·검색·가입·설정에서 등급을 노출하거나 입력받지 않는다.
- `/grade-policy`와 `/grade-policy/apply`는 `notFound()` 처리하고 메뉴에서 연결하지 않는다. 과거 UI는 활성 빌드에서 제거하며 복구 지점과 정책 결정은 `docs/archive/grade-policy.md`에 기록한다.
- 브리더 검증 상태(`pending | reviewing | approved | rejected`)와 구독 플랜(`basic | pro`)은 등급과 별개의 실제 계약으로 유지한다.
- Figma 디자인 시스템에는 `progress bar-EXP`가 있으나 EXP 산정·구간·혜택 정책은 아직 근거가 없다. BPM/EXP를 New/Elite 대체 정책으로 추정 구현하지 않는다.
- 공개 푸터의 사업자 정보는 pawpong.kr과 개인정보처리방침에 공개된 현재 값을 기준으로 한다. 확정되지 않은 전화번호·통신판매업 번호·고객센터 운영 시간을 임의로 추가하지 않는다.
- 푸터는 `/`, `/explore`, `/community`, `/hall-of-fame`, `/faq`에만 노출한다. 로그인·설정·마이홈·작성·상세·채팅처럼 사용자가 과업에 집중하는 화면에는 붙이지 않는다.

### 장식·구조

- `Breadcrumb`, `Separator`, `CtaBanner`, `ProfileAvatar`, `ProfileHeader`: 정보 계층과 브랜드 표면을 구성한다.
- `Pixel*` 컴포넌트는 Figma에서 픽셀 아트가 명시된 영역에만 사용한다.
- 서브 화면은 자체 헤더 마크업을 만들지 않고 `NavigationBar`/`PageHeader`를 사용한다. 동작이 정해지지 않은 케밥·북마크 아이콘은 노출하지 않으며, 보이는 액션은 실제 메뉴나 경로에 연결한다.

## 8. 목록 행과 삭제 패턴

- 행 전체 또는 주요 내용 영역은 한 개의 명확한 이동 버튼/링크여야 한다.
- 읽지 않음은 `point-50` 표면 + `primary-500` 점으로 표현하고, 색 하나에만 의존하지 않는다.
- 반복 목록의 삭제는 작은 “삭제” 텍스트를 노출하지 않는다.
- 즉시 되돌리기 어려운 삭제는 `OwnerActionsMenu` 또는 아이콘 버튼 → `DeleteConfirmModal` 순서로 처리한다.
- 삭제 버튼은 행 이동 버튼 안에 중첩하지 않는다.
- hover 배경은 `primary-50` 또는 `neutral-50`, focus ring은 `primary-500`을 사용한다.

## 9. 데이터·탐색 상태

- React Query 목록은 재진입 시 데이터 최신성이 필요한 화면에서 `refetchOnMount: 'always'`를 명시한다.
- 상세·작성·프로필 화면도 뒤로가기 캐시 복원 시 서버 상태를 다시 확인해야 하므로 `refetchOnMount: 'always'`와 로컬 재시도를 함께 둔다.
- 공용 `createQuery`·`createInfiniteQuery`는 동적 데이터에 이 재진입 규칙을 기본 적용한다. 품종·지역·필터처럼 `STALE_TIME.STATIC`으로 선언한 참조 데이터만 같은 세션에서 재호출하지 않는다.
- 뒤로가기로 복원되는 화면은 stale 화면을 그대로 믿지 않고, mutation 후 관련 query key를 invalidate한다.
- 무한 목록은 페이지를 평탄화한 뒤 ID 기준 dedupe를 적용한다.
- 탐색 카테고리는 `all | dog | cat | lizard`를 사용하고 API의 `petType`에는 각각 `undefined | dog | cat | reptile`로 매핑한다. 입양·브리더·커뮤니티에서 같은 매핑을 공유하며, 지원 데이터가 없다는 이유로 `lizard`를 전체 조회로 폴백하지 않는다.
- 내부 이동 URL은 `/`로 시작하는 값만 허용한다.
- API 실패를 빈 상태로 가장하지 않는다. 오류와 빈 상태를 별도로 렌더링한다.
- optimistic update를 쓰면 실패 시 반드시 rollback하고 서버 값으로 재검증한다.
- 쿠키 기반 역할 UI는 `useAuthStatus().isReady`가 true가 된 뒤에만 역할별 내용을 렌더링한다. 서버 스냅샷과 첫 클라이언트 렌더를 동일하게 유지하고, `pageshow`·`popstate`·`visibilitychange`에서 쿠키를 다시 읽어 BFCache 뒤로가기에서도 오래된 역할 UI를 남기지 않는다.

## 10. 이미지

- `next/image fill`에는 렌더 폭에 맞는 `sizes`를 필수로 지정한다.
- 첫 화면의 실제 LCP 이미지만 Next 16의 `preload` 또는 `loading="eager"`를 사용한다. 목록은 첫 카드의 첫 이미지, 상세는 히어로의 첫 이미지로 한정한다.
- 공용 이미지 컴포넌트의 선로딩 기본값은 `false`다. 호출부가 화면 내 순서를 아는 경우에만 `preload`를 명시해 모든 카드가 동시에 선로딩되는 것을 막는다.
- 탐색 카테고리처럼 첫 화면에 항상 보이는 소형 로컬 SVG 묶음은 `loading="eager"`를 허용한다.
- 서버 URL이 없거나 객체 스토리지 404가 날 수 있는 데이터는 컴포넌트 fallback을 제공한다.
- fallback은 레이아웃 비율을 유지하고 alt/장식 여부를 명확히 한다.
- 저장·업로드 후 대표 이미지 변경도 dirty 상태로 간주해 이탈 경고 대상에 포함한다.

## 11. 접근성·인터랙션

- 아이콘 단독 버튼은 동작을 설명하는 `aria-label`을 가진다.
- 아이콘의 시각 크기는 Figma의 20/24/32px을 유지하되, 모바일·태블릿의 실제 클릭·포커스 영역은 최소 40×40px로 확장한다. 음수 여백을 쓸 때는 레이아웃 점유 폭을 원래 아이콘 폭으로 보존해 브레이크포인트 경계에서 제목·로고 좌표가 이동하지 않게 한다.
- focus-visible ring은 배경과 3:1 이상 구분되도록 `primary-500`을 기본으로 한다.
- hover로만 노출되는 핵심 액션은 금지한다. 키보드 focus와 터치에서도 접근 가능해야 한다.
- pending 동안 중복 submit을 막고 레이블로 진행 상태를 알린다.
- 작성·수정 폼은 텍스트·공개 범위·기존/신규 이미지 중 하나라도 바뀌면 X 버튼, 브라우저 뒤로가기, 새로고침 모두 이탈 확인 대상이다.
- 삭제·투표·즐겨찾기처럼 서버 상태를 바꾸는 액션은 성공 후 관련 숫자와 상태를 함께 갱신한다.

## 12. 검증 매트릭스

기능을 완료할 때 아래를 모두 확인한다.

1. 경계 양쪽을 포함한 375, 767, 768, 1024, 1439, 1440, 1920px 화면에서 overflow·점프·잘림 없음
2. 키보드 Tab/Enter/ESC와 focus-visible 확인
3. pending/error/empty/content 및 긴 텍스트 확인
4. 뒤로가기·앞으로가기·재진입 후 API 재조회/캐시 정합성 확인
5. `pnpm lint`, `pnpm tsc --noEmit`, `pnpm build`
6. 관련 백엔드 단위/E2E와 실제 로컬 API/Socket 연결 확인
7. 기능 커밋·`test` 푸시 후 Obsidian 완료 기록 갱신

전체 메뉴·FAQ·설정처럼 하나의 진입 흐름으로 연결된 화면은 단순 렌더 검사에 그치지 않고 `메뉴 열기 → 링크 이동 → 브라우저 뒤로가기 → 메뉴 닫힘 상태 복원`까지 한 묶음으로 검증한다. 인증 화면은 쿠키가 없는 직접 요청의 로그인 리다이렉트도 함께 확인한다.

### Breakpoint 계약

- Mobile: `0–767px`. 375px을 기준 화면으로 쓰되 767px까지 mobile 레이아웃이 자연스럽게 확장되어야 한다.
- Tablet: `768–1439px`. 768·1024px 실사용 폭과 1439px 상단 경계를 모두 확인한다.
- PC: `1440px+`. 1440px에서 전환되고 1920px에서는 `Container` 상한과 중앙 정렬로 과도하게 늘어나지 않아야 한다.
- CSS는 `tab:`과 `pc:`만 사용한다. `md:`, `lg:`, 임시 `min-[...]` 또는 화면별 JS 분기를 새로 만들지 않는다.
- 한 픽셀 전후(767↔768, 1439↔1440)에서 열 수·거터·고정 CTA·내비게이션이 겹치거나 폭이 역전되지 않아야 한다.

## 13. FSD 컴포넌트·API 경계

- 같은 `features` 레이어의 다른 slice를 직접 import하지 않는다. 하나의 사용자 행동을 완결하는 API와 mutation은 해당 feature가 소유한다.
- 여러 feature에서 쓰는 도메인 조회·수정은 `entities`, 도메인과 무관한 전송·업로드 원시는 `shared/api`에 둔다.
- 앱·위젯은 feature의 public API를 사용하고, feature 내부 조합이 필요한 경우 하위 레이어의 public API를 조합한다.
- OAuth 가입 세션처럼 도메인 UI와 무관한 브라우저 저장소 도구는 `shared/lib`에 둔다.
- slice 이름은 단수 도메인명으로 통일한다. public API를 우회하는 deep import를 만들지 않는다.
- 구조 변경 후 `pnpm lint:fsd`, `pnpm lint`, `pnpm tsc --noEmit`, `pnpm build`를 모두 통과해야 한다.

## 14. 화면 정렬 현황

| 영역                  | Figma/공용 기준                                                  | 상태                                                              |
| --------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| GNB·BottomNav         | `3349:1763537`, `4042:780810`                                    | PC GNB 및 mo·tab 56px 최상위 내비게이션·SSR fallback 정렬         |
| 홈 배너·검색·쇼케이스 | `3349:2252855`, `4042:800891`, `4042:800892`                     | 3개 기준 폭 실측 정렬, 중간 폭 상한·보간 및 3개 배너 순환 안정화  |
| 홈 분양 카드          | `3349:1763378`, `3406:724284`, `MediaCard`                       | mo·tab/pc variant·hover·거터 정렬                                 |
| 홈 프로필·탭          | `1021:20324`, `976:32388`                                        | Figma 기준 일치, 전역 breakpoint 재검증 필요                      |
| 커뮤니티 작성         | `1056:46147`                                                     | PC 진입점을 표준 `pc:`로 통일                                     |
| 커뮤니티 신고         | `DropdownMenu`, `Dialog`, `LoginPromptModal`                     | 비소유자 메뉴·사유 검증·표준 신고 API 연결 완료                   |
| 명예의 전당           | 홈/콘테스트 컴포넌트                                             | API 상태·투표 취소 연결 완료, 데이터 이미지 점검 필요             |
| 알림                  | `NotificationListItem`, `OwnerActionsMenu`, `DeleteConfirmModal` | 그룹 목록·읽지 않음·삭제 확인·전체 보기 정렬 완료                 |
| 채팅                  | 채팅 공용 폭·Socket.IO·`ChatRoomActionsMenu`·`ChatAttachMenu`    | 딥링크·뒤로가기·방 나가기·위치 공유·Kafka 정상/장애/복구 E2E 완료 |
| 분양 임시저장         | `ListState`, `OwnerActionsMenu`, `DeleteConfirmModal`            | 재진입 강제 조회·오류 재시도·대표 사진 dirty 보호 완료            |
| API 재진입 상태       | `AsyncState`, `ListState`, `useExitGuard`                        | 상세·신청·프로필·홈·알림·커뮤니티 로컬 복구 통일                  |
| 브리더 인증 정책      | Figma 메뉴 `3555:416834`, `docs/archive/grade-policy.md`         | New/Elite 라우트·활성 UI·프론트 API 계약 제거, 인증 상태만 유지   |
| 입양자 신청·후기      | 홈 `3349:1763114`, 탭 `976:32388`, 계정 패널                     | 신청 목록·상세·후기 작성·목록·상세·역할별 진입점 실제 API 연결    |
| 입양 관심 정책        | 입양 상세 컴포넌트 세트, `FavoriteShareActions`                  | 전 breakpoint 단일 액션·소유자 숨김·서버 self-boost 403 차단 완료 |

## 15. 문서 갱신 규칙

- Figma 노드를 구현하면 해당 node ID와 코드 컴포넌트를 이 문서에 연결한다.
- 새 공용 컴포넌트/variant를 추가하면 카탈로그와 사용 조건을 함께 수정한다.
- 새 breakpoint, 임의 색, 임의 shadow, 페이지 전용 modal을 추가할 때는 기존 공용 규칙으로 해결할 수 없는 이유를 기록한다.
- 기능 하나가 브라우저·API·빌드까지 통과하면 이 문서의 현황과 Pawpong Obsidian 노트를 함께 갱신한다.
