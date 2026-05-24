'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowBackIcon } from '@/shared/assets/icons'
import { cafe24Proup } from '@/shared/lib/fonts'
import {
  Container,
  SectionHeader,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/shared/ui'
import { AdoptionCard } from '@/entities/adoption'
import { createMockListings } from '@/shared/mocks/adoption'
import { cn } from '@/shared/lib/Cn'

const BOOKMARK_TABS = [
  { id: 'favorites', label: '입양 관심' },
  { id: 'saved-feeds', label: '저장 피드' },
  { id: 'adoption-list', label: '입양목록' },
] as const

const BookmarksContent = () => {
  const [activeTab, setActiveTab] = useState('favorites')

  // TODO: 실제 API 연동
  const listings = createMockListings().filter((l) => l.status === 'available')

  return (
    <div className="flex w-full flex-col">
      {/* 모바일 헤더 */}
      <div className="flex items-center gap-2.5 px-5 py-3 tab:hidden">
        <Link href="/home" aria-label="뒤로 가기">
          <ArrowBackIcon className="size-5 text-text-primary" />
        </Link>
        <h1 className="text-sm font-semibold leading-[1.5] text-text-primary">
          저장목록
        </h1>
      </div>

      {/* PC 헤더 */}
      <div className="hidden tab:block">
        <Container>
          <div className="flex items-center justify-center py-10">
            <div className="flex flex-1 items-center">
              <Link href="/home" aria-label="뒤로 가기">
                <ArrowBackIcon className="size-6 text-text-primary" />
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-text-primary">
              저장 목록
            </h1>
            <div className="flex-1" />
          </div>
        </Container>
      </div>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b border-border-light">
          <Container>
            <TabsList className="flex w-full items-center gap-8">
              {BOOKMARK_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    'group flex flex-1 min-w-px items-center justify-center p-2.5',
                    'data-[state=active]:border-b-2 data-[state=active]:border-text-primary',
                  )}
                >
                  {/* 모바일: cafe24 폰트 */}
                  <span
                    className={cn(
                      cafe24Proup.className,
                      'font-cafe24 text-xs leading-[1.375rem] text-[#a7a7a7] whitespace-nowrap tab:hidden',
                      'group-data-[state=active]:text-text-primary',
                    )}
                  >
                    {tab.label}
                  </span>
                  {/* PC: Pretendard */}
                  <span
                    className={cn(
                      'hidden text-base font-medium leading-[1.375rem] text-[#a7a7a7] whitespace-nowrap tab:inline',
                      'group-data-[state=active]:font-semibold group-data-[state=active]:text-text-primary',
                    )}
                  >
                    {tab.label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Container>
        </div>

        {/* 입양 관심 탭 */}
        <TabsContent value="favorites" className="mt-0">
          <Container>
            <div className="pt-5 tab:pt-8">
              <SectionHeader
                title={`입양 관심목록 ${listings.length}`}
                linkText="입양페이지 가기"
                linkHref="/adoption"
              />
            </div>

            {/* 모바일: 2열 그리드 */}
            <div className="grid grid-cols-2 gap-4 pb-15 pt-3 tab:hidden">
              {listings.map((listing) => (
                <AdoptionCard key={listing.listingId} listing={listing} />
              ))}
            </div>

            {/* PC: 3열 그리드 */}
            <div className="hidden tab:mt-6 tab:grid tab:grid-cols-3 tab:gap-[1.156rem] tab:pb-10">
              {listings.map((listing) => (
                <AdoptionCard key={listing.listingId} listing={listing} />
              ))}
            </div>
          </Container>
        </TabsContent>

        {/* 저장 피드 탭 */}
        <TabsContent value="saved-feeds" className="mt-0">
          <Container>
            <div className="flex items-center justify-center py-20 text-sm text-[#a7a7a7]">
              저장된 피드가 없습니다.
            </div>
          </Container>
        </TabsContent>

        {/* 입양목록 탭 */}
        <TabsContent value="adoption-list" className="mt-0">
          <Container>
            <div className="flex items-center justify-center py-20 text-sm text-[#a7a7a7]">
              입양 목록이 없습니다.
            </div>
          </Container>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { BookmarksContent }
