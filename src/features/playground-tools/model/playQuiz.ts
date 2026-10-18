/**
 * 취향 찾기·멍냥BTI 공통 진행 규칙. 화면은 타이머와 포커스만 맡고, 상태 변화는 여기서 정한다.
 * - 고르면 picked 로 잠깐 표시한 뒤 advance 로 다음 질문(마지막이면 섞기)으로 넘어간다.
 * - 넘어가는 중에 다시 눌러도 질문을 건너뛰지 않는다.
 * - 앞 질문으로 돌아가도 고른 답은 남는다.
 */
export type PlayQuizPhase = 'asking' | 'shuffling' | 'done'

export type PlayQuizState = {
  step: number
  answers: number[]
  phase: PlayQuizPhase
  /** 방금 고른 답(통 튀는 중). 넘어가면 null */
  picked: number | null
  /** 고를 때마다 늘어 장면의 카드를 한 번 튀게 한다. */
  beat: number
}

export type PlayQuizAction =
  | { type: 'pick'; index: number }
  | { type: 'advance'; total: number }
  | { type: 'reveal'; total: number }
  | { type: 'done' }
  | { type: 'go'; step: number; total: number }
  | { type: 'restart' }

export const initialPlayQuiz: PlayQuizState = {
  step: 0,
  answers: [],
  phase: 'asking',
  picked: null,
  beat: 0,
}

const answeredAll = (answers: readonly number[], total: number) =>
  answers.length === total &&
  Array.from({ length: total }, (_, i) => answers[i]).every(Number.isInteger)

export function playQuizReducer(state: PlayQuizState, action: PlayQuizAction): PlayQuizState {
  switch (action.type) {
    case 'pick': {
      if (state.phase !== 'asking' || state.picked !== null || !Number.isInteger(action.index))
        return state
      const answers = [...state.answers]
      answers[state.step] = action.index
      return { ...state, answers, picked: action.index, beat: state.beat + 1 }
    }
    case 'advance': {
      if (state.picked === null) return state
      if (state.step >= action.total - 1)
        return answeredAll(state.answers, action.total)
          ? { ...state, picked: null, phase: 'shuffling' }
          : { ...state, picked: null }
      return { ...state, picked: null, step: state.step + 1 }
    }
    case 'reveal':
      return state.phase === 'asking' && answeredAll(state.answers, action.total)
        ? { ...state, picked: null, phase: 'shuffling' }
        : state
    case 'done':
      return state.phase === 'shuffling' ? { ...state, phase: 'done' } : state
    case 'go': {
      const step = Math.min(Math.max(0, Math.trunc(action.step)), action.total - 1)
      return { ...state, picked: null, phase: 'asking', step }
    }
    case 'restart':
      return { ...initialPlayQuiz, beat: state.beat }
  }
}
