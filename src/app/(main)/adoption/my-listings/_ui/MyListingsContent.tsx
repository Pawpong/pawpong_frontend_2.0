'use client'

import { Container, InputUpload, NavigationBar } from '@/shared/ui'
// [refactored] 상태 필터 + 그리드 + 무한 스크롤은 마이홈 분양 탭과 같아 위젯으로 공유
import { MyPetPostingList } from '@/widgets/my-pet-postings'

const PAGE_SIZE = 16

/** 브리더 분양 페이지 (Figma 3138-493376) — 작성 유도 바 + 상태 필터 + 내 분양글 그리드 */
const MyListingsContent = () => (
  <div className="flex w-full flex-col pb-12">
    <NavigationBar title="분양 페이지" backHref="/home" />

    <InputUpload text="분양할 동물 작성하러가기" href="/adoption/create" />

    <Container className="py-6 tab:py-10">
      <MyPetPostingList pageSize={PAGE_SIZE} showTotalCount />
    </Container>
  </div>
)

export { MyListingsContent }
