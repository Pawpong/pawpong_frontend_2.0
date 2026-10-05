# 전신 캐릭터·밝은 방 검증 (2026-10-06)

Obsidian 고전 도트 게임 v2의 사용자 시각 수정 기준을 적용했다. 사진 필터와 게임 목적을 분리하고 검증된 전신만 게임에 연결한다. 기존 초상화·사용자 상태는 보존한다. 공개 품질 승인·공개 및 IAP 토글은 변경하지 않는다.

최신 FE dev `dd7b341d`·BE dev `d5b9036b`를 각 소유 브랜치에 안전하게 FF 통합했다. FE 전체367 tests, 타입 검사, build와 변경 파일 lint가 통과했다. BE 전체2492 tests/기존8 skip 뒤 추가한 교체 회귀까지 HTTP29 tests, 실제 CPU gRPC PNG1 test, Python56 tests와 타입/build/변경 파일 lint가 통과했다. 실제 codex review의 필수 자산 갱신·cached config 오류·character 키 보존·alpha0 구멍 보존·2px CPU 검수 문제를 수정했다. 감독자의 기존 전신 교체 UI 리뷰도 반영했다.

기존 실제 OpenAI adapter/workflow로 합성 Maltese 참고 그림을 생성했다. 최종96×96·576×96시트,24색·hard alpha·2px 격자와 실제 semantic validator의6항목 all true를 확인했고 얼굴만 자른 입력은 거절했다. 이 실제 제공자 호출은 실사용자 생성 job/쿼터 검증과 다르다. Nest/JWT/Mongo·storage fixture·CPU 프리뷰는 격리 합성 소유자이며 실제 심사 계정이나 live dev Kafka/storage 로그인 검증이라고 주장하지 않는다. 새 계약이 live dev에 배포되기 전이고 실제 적격 심사 계정이 제공되지 않아 해당 흐름은 감독자 통합 이후 검증 대상이다.

Orca 내장 브라우저에서 구형 친구의 명시 연결, 인사 보상8EXP/+11별, 숲 벽지 구매-16/적용, 실제30초 간식 이동/서버7점/+11별·EXP8 유지·새로고침 상태를 확인했다. 필수 벽지404를 주입한 실제 화면은 밝은 fallback 창/자연광/바닥/가구/전신과 canvas 밖 오류를 보여주며 두 게임 시작은 disabled다. 주입한 manifest는 byte-for-byte 복원했다.

390×844/DPR3의 DOM/header1/canvas1/scrollWidth390·실제 캔버스 geometry와 기본 음소거를 검수했다. 감독자가 모바일 전신을 직접 확인했다. DPR3 Orca 페이지 캡처의 반복 타일 결함은 앱 DOM과 분리했다. 정상 DPR1 페이지와 DPR3 RAF canvas 픽셀, 정상 데스크톱/자산 실패 screenshot을 증거로 채택했다. 빈 WebGL readback·반복 타일 캡처는 diagnostic 자료다. reduced motion·세션/보상/쿼터/기존 게임 회귀는 테스트에 포함한다.

영구 증거는 `/Users/kscold/orca/task-artifacts/pawpong-pet-character-20261005/delivery-report.md`, `final-generation-verification.json`, `connection-flow.json`, `browser-flow-final.json`, `browser-network-console.json`, `asset-failure-desktop.png`, `room-canvas-mobile-dpr3.png`와 검증 로그다. worker는 source commit/push/PR-ready까지 담당하며 dev/main 병합·배포·워크스페이스 settlement/release/삭제는 감독자가 조율한다. 기술 배포는 공개 승인이 아니다.
