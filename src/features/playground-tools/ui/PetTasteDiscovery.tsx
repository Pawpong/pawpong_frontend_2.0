'use client'

import { TASTE_QUESTIONS } from '../constants/discovery'
import { tasteResult } from '../model/discovery'
import { useToolOwner } from '../model/useToolOwner'
import { PlayQuiz } from './PlayQuiz'
import { ToolPage } from './ToolPage'

export function PetTasteDiscovery() {
  const owner = useToolOwner()
  return (
    <ToolPage
      title="우리 아이 취향 찾기"
      description="잘 아는 것 같다가도 새롭게 보이는 우리 아이. 오늘은 어떤 모습이 떠오르나요?"
    >
      {owner === null ? (
        <p role="status" className="text-sm text-neutral-700">
          취향 놀이를 준비하고 있어요.
        </p>
      ) : (
        <PlayQuiz
          key={owner}
          owner={owner}
          id="taste"
          accent="blue"
          questions={TASTE_QUESTIONS}
          getResult={tasteResult}
          intro={{
            title: '가장 가까운 모습을 골라보세요',
            body: '네 가지 질문, 정답은 없어요. 지금 떠오르는 모습을 고르면 충분해요.',
          }}
          resultTitle="오늘 완성한 우리 아이 취향 카드"
          shuffleText="우리 아이 취향 카드를 펼치고 있어요…"
          stamp={() => 'MY TASTE'}
        />
      )}
    </ToolPage>
  )
}
