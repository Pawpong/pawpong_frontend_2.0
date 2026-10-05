# 내 반려동물 키우기 classic v2 프론트엔드

## 범위와 공개 잠금

Obsidian 선행 기획과 game-v2-brief/game-v2-contract를 바탕으로 기존 pet 세션과 API를 확장한다. main 기반 소스에 pet 기능만 포함하며 dev의 다른 기능은 가져오지 않는다. 운영 품질 승인과 공개 설정은 OFF, 인앱결제는 비활성 상태를 유지한다. 별사탕은 게임 내부 재화이며 현금 구매 UI나 호출을 추가하지 않는다.

## 서버가 보관하는 상태

잔액, 레벨/EXP, 카탈로그의 24개 가격/해금 조건, 소유 목록, 6개 가구 슬롯, 업적, 게임 세션, 점수와 보상은 PetView/API 응답만 사용한다. 미리보기는 room 객체를 복사해 한 슬롯만 바꾸며 구매/소유/잔액을 갱신하지 않는다. 서버 응답의 revision이 현재보다 낮으면 캐시를 되돌리지 않고 모든 변경 뒤 최신 view를 다시 읽는다.

추가 POST는 items/purchase, room, games/start, games/cancel, games/memory/flip, games/snack/finish다. 모든 요청은 expectedRevision과 idempotencyKey를 포함한다. 애매한 실패는 원래 body/key를 보존하고 사용자 명시 재시도만 허용한다. 401은 현재 세션 자격만 복구하며 변경 요청을 자동 재전송하지 않는다. 계정 변경은 기존 token에 묶인 응답을 폐기하고 private cache와 진행 중 요청을 정리한다. 공유 Axios 클라이언트를 변경하지 않는다.

## 렌더링과 개인 캐릭터

Phaser 4.2.1 exact를 PetStage 클라이언트 effect에서 동적으로 불러온다. 앱 전체를 Phaser로 옮기지 않는다. 화면은 320×224, 벽 320×128, 바닥 320×96이며 원본 PNG 가구를 쌓는다. public/playground/pet/v2/manifest.json과 pixel-art.md의 원본 이미지 계약을 사용한다. 24개 소품의 assetKey는 서버 item ID와 동일하며 외부/경로 이탈 URL을 받지 않는다.

개인 character API의 image/png Blob을 검증해 576×96의 96×96 6프레임 sheet 하나만 방과 간식 게임에서 함께 사용한다. 논리 격자는48×48를 nearest2배 확대한 것이며 발 기준은 anchor (48,84)다. hard alpha, 최대48색,2×2 격자, 각 프레임 padding/빈 실루엣/잘림을 검사한다. 공용 강아지나 원본 초상화로 방 캐릭터를 대체하지 않는다. 준비 실패는 명시 재시도를 제공하고 게임 시작을 막는다. 원래 그림은 기록에서 보존한다. 이미지 객체 URL은 소유 세션/반려동물/연결 캐릭터 작업에 묶이며 변경, 실패, unmount 때 revoke한다.

`PetView.pet.character.format=pet-sprite-v1`만 character를 불러오고 게임 시작을 연다. 필드 누락도 구형 portrait로 취급한다. 구형 친구는 밝은 방·기존 돌봄·기록·구매 소품을 유지하며 전신 연결 안내를 보여준다. 사용자가 선택한 eligible sourceJobId를 `POST /character-source`로 보내며 이름/성장/원래 그림을 바꾸거나 생성·사용량을 자동 실행하지 않는다. `/ai-filter?purpose=pet-sprite-v1`은 게임용 생성을 명시적으로 선택한 화면이다. 서버 config가 닫혔거나 갱신 오류가 나면 cached enabled 데이터가 있어도 화면을 차단한다. 일반 사진 필터는 이 purpose를 보내지 않는다.

구형 친구의 첫 방 아래에는 연결 안내와 native anchor가 있다. 이미 전신을 연결한 사용자도 새 result link의 sourceJobId가 현재 character와 다르면 명시 선택 섹션을 열 수 있다. 현재 character는 제출 전까지 유지하고, 실제 연결 응답의 새 source로 sheet를 갱신한다. eligible에 없는 후보는 제출하지 않는다. 오류/준비 안내는 canvas 밖에 배치하여 전신과 밝은 방을 가리지 않는다.

Phaser camera/clearColor와 동기 fallback 방은 불투명 크림색, 창문·햇빛·나무 바닥을 갖는다. 선택한 방/간식 게임의 필수 그림만 먼저 읽으며 사용하지 않는 상점 그림은 준비를 지연하지 않는다. 장착/미리보기/게임 변경 때 필수 자산을 재검사한다. 선택 자산이 실패해도 밝은 fallback과 성공한 다른 레이어를 보여주고 작은 오류 안내와 재시도를 제공한다. 게임 시작은 실패 상태에서 차단한다.

PetStage는 게임 인스턴스 하나를 유지하고 immutable snapshot을 sync한다. 탭, 구매 미리보기, 서버 응답, 게임 시작/종료마다 Canvas/WebGL을 다시 만들지 않는다. unmount는 이미지 핸들러와 pending fetch를 취소하고 Phaser를 파괴한다. Phaser destroy가 다음 프레임까지 지연되므로 실행을 시작한 게임은 public headlessStep의 pendingDestroy 경로를 호출해 숨겨진 탭의 정지 루프에서도 정리한다. 초기 texture boot가 아직 끝나지 않은 게임은 READY 이벤트의 동기 start가 끝난 microtask에서 같은 경로로 정리한다. 재실행 가능한 페이지이므로 noReturn을 켜지 않는다.

## 두 미니게임

기억 맞추기는 서버가 공개한 revealed와 matchedIndices만 DOM 카드 8개로 보여준다. 클라이언트에 숨겨진 덱이나 짝 ID를 전달하지 않는다. 서버 mismatch lockUntil 동안 버튼을 잠그고 시간이 지나면 최신 상태를 읽는다. 네 쌍을 완성한 최종 서버 session snapshot으로 결과 카드를 보여준다. 새로고침으로 복원한 게임도 완료 후 결과 탭을 유지한다.

간식 받기는 서버가 정한 28개 drops를 30초 동안 개인 캐릭터와 함께 보여준다. 기록하는 입력은 정수 tMs 0..30000, 인접한 lane 이동, 80ms 이상 간격, 최대 180개다. 화면 점수는 미리보기로 명시하고 서버에는 sessionId와 입력 목록만 보낸다. 점수/보상/경과 시간을 클라이언트에서 확정하거나 전송하지 않는다. 30초 후 결과 저장을 명시적으로 누르며 uncertain retry는 정확히 같은 입력 목록과 key를 유지한다.

페이지를 새로 열어 로컬 이동 기록이 없거나 화면이 숨겨진 판은 보상 없이 종료한 뒤 새 판을 시작하도록 안내한다. 기록을 날조해서 복원하거나 자동 완료하지 않는다. 만료/취소/연습 모드도 서버 상태를 따르며 게임은 pet EXP나 계정 경험치를 바꾸지 않는다.

## 조작과 오류

버튼, 카드, 수치, 팝업은 React DOM이다. 44px 이상 터치 영역, 탭 방향키/Home/End, 간식 좌우 방향키, native dialog focus/취소, status/alert 안내를 제공한다. 진행 중 게임의 화면과 조작은 같은 휴대형 기기 안에 있다. 진행 안내와 uncertain retry는 Canvas 밖에 놓아 캐릭터를 가리지 않는다.

게임 그림의 실제 준비 완료를 확인해야 시작 버튼을 연다. dynamic import 실패도 다시 시도할 수 있다. reduced motion은 대기 프레임과 보상 파티클을 줄인다. 소리는 기본 OFF이며 사용자 동작으로만 AudioContext를 활성화하고 화면 숨김/정리 시 중단한다. 이전 API가 game 데이터를 제공하지 않으면 돌봄/기록과 원본 초상화를 유지하고 사용할 수 없는 v2 탭과 키보드 이동을 제외한다.

서버를 읽지 못하면 저장된 view를 유지하고 변경 버튼을 잠근 뒤 최신 상태 재시도를 제공한다. 늦은 응답, 거절, uncertain, character/asset 실패를 각각 복구할 수 있어야 한다.

## 검증 기준

- 실제 Axios 인터셉터를 사용하는 세션 테스트: token binding, 401 자격 복구, 변경 자동 재전송 금지, 이전 계정의 늦은 응답 폐기.
- immutable room preview/인벤토리/구매 조건, 입력 범위/간격/인접 lane/180개 제한, landing 시점 replay, identical finish retry.
- 공개 카드만 렌더, mismatch 잠금, 실제 Canvas 준비, 복원한 판의 결과 탭, import 실패 재시도, 한 게임 유지, Blob abort/revoke, reduced motion과 숨김 루프 cleanup.
- 전체 소스 테스트·타입 검사·빌드·lint와 실제 codex review, Orca 내장 브라우저 390/768/1440 화면 확인.
- 실제 Nest/JWT/임시 Mongo 검수와 HTTP 합성 fixture를 구분한다. 개인 캐릭터 fixture 사용 여부와 DOM 입력 검증/네이티브 키 입력 도구의 한계도 명시한다. 실제 미입양 심사 계정의 게임 실행으로 보고하지 않는다.
