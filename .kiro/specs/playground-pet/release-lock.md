# 반려동물 키우기 운영 공개 잠금 (2026-10-05)

사용자가 관리자 잠금 상태로 pet 부분만 main 배포를 승인했다. 전체 dev나 다른 미승격 기능은 승격하지 않는다. 고전 게임/꾸미기/아이템/미니게임 품질 개발은 공개 잠금 배포 이후 dev에서 한다. Obsidian `Projects/Pawpong/놀이터_도트친구_다마고치_기획_v1.md`의 2026-10-05 변경 지시를 먼저 반영했다.

## 공개 조건

- 환경 판별은 backend config를 조회할 수 있는 후보만 결정한다. 개발은 기존 development·명시적 플래그·허용 호스트 조건을 유지한다.
- 운영 후보는 Vercel production·main·pawpong.kr/www.pawpong.kr의 동시 충족이다. Host만 바꾸거나 dev/preview 배포에서 운영 호스트를 보내도 허용되지 않는다.
- 운영 backend config의 `success === true`, `data.enabled === true`, `data.publicEnabled === true`를 모두 확인해야 화면을 내보낸다. dev preview가 enabled인 것만으로 운영이 열리지 않는다.
- backend의 관리자 qualityApproved/published는 기본 false이며 운영 private pet API도 같은 guard로 보호한다. 운영 데이터의 공개 설정을 켜지 않는다.
- 페이지 SSR과 config BFF가 같은 server helper를 사용하며 `cache: no-store`, 5초 제한으로 판별한다. 미등록·404·실패·비공개면 직접 페이지도 닫는다. BFF 오류는 enabled:false/503이며 private,no-store다.
- 놀이터 카드와 AI 결과 CTA는 config 응답을 따르므로 비공개 상태에서 진입을 보여주지 않는다. 이용권·결제 UI와 호출은 비활성으로 유지한다.

## 선별 반영 범위

기존 dev의 entities/playground-pet, features/playground-pet, pet page/config BFF, pet 테스트와 문서 및 놀이터 카드/AI 결과의 pet CTA 부분만 main 기반 작업 브랜치로 가져온다. 약관 초안, favorite/share/AI support의 미승격 기능이나 dev 전체는 포함하지 않는다.

## 검증

개발 미리보기와 운영 config 구분, 명시적 승인 없는 운영 차단, 허용되지 않은 호스트·배포·브랜치 차단, backend 404/실패, 응답 개인 필드 제외를 테스트한다. 기존 입양·명령 중복·세션·revision 검증을 유지하고 타입/린트/빌드 및 Orca 운영 메뉴·직접 URL/config 차단을 확인한다. 관리자 실제 운영 설정은 OFF를 유지하고 배포 성공을 공개 승인으로 취급하지 않는다.

## 계정 경계 검수

- 비공개 요청은 호출 시 토큰을 고정하고 자동 인증 refresh 재전송을 비활성화한다. Axios 인터셉터 실행 전 계정이 바뀌거나 이전 계정 요청의 지연된 401이 도착해도 새 계정으로 돌봄 명령을 보내지 않는다. 이미지 자격 커서의 모든 페이지도 같은 토큰을 사용한다.
- 쿠키가 조용히 만료된 경우 세션 변경을 통지하고 요청 잠금을 해제하여 로그인 화면으로 복귀할 수 있다.
- 실제 설치된 Axios의 지연된 401/계정 전환/전송 전 전환/커서 전환 재현과 컨트롤러 만료 상태를 검증한다.

- 현재 세션의 요청이 401로 거절되면 기존 세션 복구로 자격만 갱신/폐기한다. 거절된 명령은 재전송하지 않고 변경된 세션이 자신의 최신 상태를 조회한다. 계정이 이미 바뀌었으면 복구도 시작하지 않는다.
