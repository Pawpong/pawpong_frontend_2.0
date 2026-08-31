import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    ignores: ['**/*.md'],
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
    },
  },
  {
    /**
     * features/auth/server.ts 는 next/headers 를 쓰는 서버 전용 public API 라
     * 클라이언트 배럴(index.ts)과 의도적으로 분리돼 있다. 합치면 빌드가 깨진다.
     * Steiger 는 슬라이스당 진입점을 하나로만 보므로 이 두 곳만 예외로 둔다.
     */
    files: [
      './src/app/(main)/adoption/create/layout.tsx',
      './src/app/(main)/adoption/drafts/page.tsx',
      './src/app/(main)/adoption/my-listings/page.tsx',
      './src/app/(main)/settings/page.tsx',
      './src/app/(main)/grade-policy/apply/page.tsx',
    ],
    rules: {
      'fsd/no-public-api-sidestep': 'off',
    },
  },
])
