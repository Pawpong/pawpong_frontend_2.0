import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // 로컬에만 두는 시안·실험 페이지(git 에 올리지 않음)는 검사하지 않는다
    ignores: [
      '**/*.md',
      './src/app/dev/**',
      './src/app/lab/**',
      './src/app/(main)/home-preview/**',
    ],
  },
  {
    files: ['./src/**'],
    rules: {
      /**
       * FSD 표준 세그먼트는 ui/api/model/lib/config 이고 types 같은 이름은 안티패턴으로 본다.
       * 다만 이 프로젝트는 CLAUDE.md가 shared/types/{Domain}Types.ts 를 규정하고 있고,
       * 도메인별로 파일이 나뉘어 있어 이 룰이 겨냥하는 "무관한 것들이 한 폴더에 쌓이는" 증상이 없다.
       * 이관 시 145개 파일이 바뀌는데 얻는 것이 폴더명 하나뿐이라 현행을 유지한다.
       */
      'fsd/segments-by-purpose': 'off',
      // 위반이 아니라 구조 권고라 CI 실패 사유로 삼지 않는다
      'fsd/insignificant-slice': 'off',
      'fsd/shared-lib-grouping': 'off',
      'fsd/excessive-slicing': 'off',
    },
  },
  {
    /**
     * 서버 전용 공개 API(<슬라이스>/server.ts, shared/lib/server)는 next/headers·server-only 를 써서
     * 클라이언트 배럴(index.ts)과 합칠 수 없다. Steiger 는 슬라이스당 진입점을 하나로만 보므로
     * 서버 코드가 사는 app 계층에서만 이 규칙을 끈다.
     * 대신 tests/fsd.test.cjs 가 "app 계층의 안쪽 import 는 /server 진입점뿐"인지 따로 검사한다.
     */
    files: ['./src/app/**'],
    rules: {
      'fsd/no-public-api-sidestep': 'off',
    },
  },
  {
    // app/api 아래 폴더 이름은 API 주소(/api/.../config)라 세그먼트 이름과 겹쳐도 바꿀 수 없다
    files: ['./src/app/api/**'],
    rules: {
      'fsd/no-reserved-folder-names': 'off',
    },
  },
])
