'use client'

import { BTI_NAME, BTI_QUESTIONS } from '../constants/discovery'
import { btiResult } from '../model/discovery'
import { useToolOwner } from '../model/useToolOwner'
import { PlayQuiz, type PlayQuizQuestion } from './PlayQuiz'
import { ToolPage } from './ToolPage'

// 취향 찾기와 같은 진행(고르면 바로 다음 질문, 마지막에 카드 섞기)과 결과 티켓을 쓴다. 문항만 둘 중 하나다.
const QUESTIONS: readonly PlayQuizQuestion[] = BTI_QUESTIONS.map((question) => ({
  title: question.title,
  options: question.options.map((option) => option.label),
}))

export function PetBtiDiscovery() {
  const owner = useToolOwner()
  return (
    <ToolPage
      title={`우리 아이 ${BTI_NAME}`}
      description="열두 가지 질문으로 알아보는 우리 아이의 16가지 성향. 평소 모습을 떠올려 보세요."
    >
      {owner === null ? (
        <p role="status" className="text-sm text-neutral-700">
          성향 놀이를 준비하고 있어요.
        </p>
      ) : (
        <PlayQuiz
          key={owner}
          owner={owner}
          id="bti"
          accent="peach"
          questions={QUESTIONS}
          getResult={btiResult}
          intro={{
            title: '평소 모습에 더 가까운 쪽을 골라요',
            body: '열두 가지 질문, 정답은 없어요. 둘 중 더 가까운 쪽이면 충분해요.',
          }}
          resultTitle={`우리 아이의 ${BTI_NAME}`}
          shuffleText="우리 아이 성향 카드를 펼치고 있어요…"
          // 결과 식별자 bti-enfp 의 네 글자를 도장으로 찍는다.
          stamp={(card) => card.id.replace(/^bti-/, '').toUpperCase()}
        />
      )}
    </ToolPage>
  )
}
