Steiger 0.6.0은 Zod 3을 고정해 GHSA-mrhx-c7xc-m3w5의 영향 버전을 설치한다. 현재 최신 Steiger 0.8.0도 Zod 3을 사용하므로 기존 FSD 규칙을 유지하면서 `pnpm.overrides`로 Zod 4.6.7과 zod-validation-error 4.0.2를 연결한다.

`steiger@0.6.0.patch`는 부분 규칙 설정에 `partialRecord`를 쓰고, 동기·비동기 규칙 함수의 인수·this·결과 검증을 유지하도록 Zod 4 API에 맞춘다. 공개 타입의 Zod 3 전용 타입 참조도 제거한다. 취약점 제외나 `zod/v3` 재사용은 하지 않는다.

`node --test tests/steiger-security.test.mjs`로 실제 프로젝트 설정, 잘못된 설정 거부, 동기·비동기 검증을 확인한다. Steiger가 패치된 Zod를 공식 지원하면 두 override와 이 패치를 함께 제거한다.
