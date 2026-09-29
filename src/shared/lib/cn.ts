import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// 커스텀 폰트사이즈 토큰(text-body-*)을 font-size 그룹으로 등록.
// 기본 설정은 이를 텍스트 색상으로 오분류해 text-[#...] 등 색상 클래스를 잘못 제거함
// tv 도 같은 규칙을 쓰도록 export — createTV({ twMergeConfig: TW_MERGE_CONFIG })
export const TW_MERGE_CONFIG = {
  extend: {
    classGroups: {
      'font-size': [{ text: ['body-s', 'body-sm', 'body-md', 'body-lg', 'body-xl'] }],
    },
  },
}

const twMerge = extendTailwindMerge(TW_MERGE_CONFIG)

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
