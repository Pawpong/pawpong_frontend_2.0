import { createTV } from 'tailwind-variants'
import { TW_MERGE_CONFIG } from './cn'

// 기본 tv 는 text-body-* 를 글자색으로 오분류해 text-white 같은 색 클래스를 지운다.
// cn 과 같은 병합 규칙을 쓰도록 모든 tv 는 여기서 import 한다.
export const tv = createTV({ twMergeConfig: TW_MERGE_CONFIG })

export type { VariantProps } from 'tailwind-variants'
