import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import prettierConfig from 'eslint-config-prettier'

const eslintConfig = defineConfig([
  ...nextVitals,
  prettierConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/components/*'],
              message:
                'Use shared, entities, features, widgets, or app layers instead of components.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/*', '@/widgets/*', '@/features/*', '@/entities/*'],
              message: 'The shared layer must not depend on upper FSD layers.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/entities/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/*', '@/widgets/*', '@/features/*'],
              message: 'The entities layer must not depend on widgets, features, or app.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/*', '@/widgets/*'],
              message: 'The features layer must not depend on widgets or app.',
            },
          ],
        },
      ],
    },
  },
  // api.generated.ts 는 openapi-typescript 산출물이라 사람이 고치지 않는다 (린트 대상 제외, tsc 는 그대로 검사)
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/shared/types/api.generated.ts',
    // .claude/worktrees 는 도구가 만든 리포 사본이라 lint 대상이 아니다.
    // (gitignore 돼 있지만 eslint flat config 는 .gitignore 를 자동으로 따르지 않아 `pnpm lint` 가 통째로 실패했다)
    '.claude/**',
  ]),
])

export default eslintConfig
