# 커뮤니티 완성 — 프론트 (2026-10-07)

대상은 `dev`뿐이다. 운영·인앱결제·반려동물 게임 공개 설정은 건드리지 않는다.
서버 계약은 백엔드 저장소의 `.kiro/specs/community-complete-20261007/contract.md`를 따른다.

## 노출 조건

- `GET /api/community/experience/config`(BFF)가 `enabled: true`일 때만 틀·기록·필터·관련 글이 보인다.
  BFF는 `dev.pawpong.kr`과 로컬 개발 호스트에서만 서버를 조회하고, 그 밖에서는 닫힌 값을 준다.
- `GET /api/community/review`가 `enabled: true`일 때만 심사 동의와 자동 태그가 동작한다.
- 서버 설정이 404·오류면 기존 커뮤니티 화면 그대로다.

## 자동 태그

- 확인 단계가 없다. 작성자가 AI 처리에 동의하고 올리면 서버가 글과 사진으로 주제·태그를 붙여
  `experience.topics` / `experience.tags`로 돌려주고, 프론트는 그대로 보여 준다.
- 프론트는 태그를 지어내지 않는다. 별도 추천·분류 호출도 하지 않는다.
- 작성 직후 내 글 상세에서 "보낸 값과 저장된 값의 차이"를 자동으로 붙은 것으로 안내하고 수정 화면으로 연결한다.
  이 차이는 그 탭의 `sessionStorage`에만 두며, 다른 탭·다른 기기에서는 안내가 보이지 않는다.
- 수정 화면에서 태그는 칩의 ×로 빼고, 주제는 다시 눌러 뺀다.

## 작성 틀

| 틀 | 대표 주제 | 기록 | 필수 |
|---|---|---|---|
| 산책 기록 | `walk` | `experience.walk` | 날짜 |
| 병원 방문 | `clinic` | `experience.clinic` | 날짜, 병원 이름, 방문 목적 |
| 일상·돌봄 | `daily` | `experience.life` | 날짜, 활동 |
| 여행·나들이 | `travel` | 없음(코스·장소) | 없음 |
| 질문하기 | `question` | 없음(`question: true`) | 없음 |

- 여러 틀을 함께 켤 수 있다. 주제 3개가 차면 기록 칸만 열고 작성자가 고른 주제를 지킨다.
- 방문 목적과 활동의 처음 값은 `other`(기타)다.
- 거리는 km로 받고 m 정수로 보낸다. 범위는 서버 검증과 같다.
- 빈 선택 값은 보내지 않는다. 새 글에서 경험이 비면 `experience`를 생략하고, 고치는 글에서 모두 비우면 `null`을 보낸다.
- 임시저장·세션 경계·사진 소유 업로드는 원본 브랜치 동작을 그대로 쓴다.

## 찾기

- 필터는 주소 쿼리가 원본이다: `topics, topicMatch, tags, kind, media, period, record`.
  모르는 값은 버린다. 상세의 주제·태그 링크와 카드의 칩이 같은 주소를 만든다.
- 관련 글은 `GET /community/posts/:postId/related`를 쓴다. 응답을 받지 못하면 같은 태그의 최신 글로 대신하고,
  그것도 없으면 영역을 숨긴다. 실패해도 글 화면은 유지한다.
- 저장한 글은 `/bookmarks?tab=saved-feeds`로 다시 연다.

## 배지

- 배지 획득 규칙과 `src/entities/gamification`, `src/features/gamification`은 dev(#428, #430) 그대로다.
- 커뮤니티 화면은 기존 `usePublicActivityBadges` / `ActivityBadgeRow`만 쓴다.

## 서버 확인이 남은 것

1. 작성자가 뺀 AI 태그가 다시 심사할 때 유지되는지
2. `experience` 없이 올린 글에도 자동 분류 결과로 `experience`를 만들어 주는지
3. `review/config`에 추가될 주제·기록 옵션의 필드명(지금은 무시해도 동작한다)
