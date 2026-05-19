'use client'

import { useState } from 'react'
import { BookmarkIcon } from '@/shared/assets/icons'
import { Container, Separator } from '@/shared/ui'
import { MOCK_MY_HOME_PROFILE, MOCK_MY_HOME_POSTS } from '@/shared/mocks/myHome'
import { ProfileCard } from './ProfileCard'
import { MyHomeTabs, type TabType } from './MyHomeTabs'
import { PostCreateBar } from './PostCreateBar'
import { PostCard } from './PostCard'

const MyHomeContent = () => {
  const [activeTab, setActiveTab] = useState<TabType>('posts')
  const profile = MOCK_MY_HOME_PROFILE
  const posts = MOCK_MY_HOME_POSTS

  return (
    <div className="flex w-full flex-col">
      {/* Title Section — px-100px on desktop */}
      <div className="px-[1.25rem] tab:px-[6.25rem]">
        <div className="flex items-center justify-center py-[0.75rem] tab:justify-between tab:pb-[3.219rem] tab:pt-[2.969rem]">
          <div className="hidden flex-1 tab:block" />
          <h1 className="text-sm font-semibold leading-[1.5] text-[#5d5d5d] tab:text-xl tab:font-medium tab:leading-[1.375rem]">
            마이홈
          </h1>
          <div className="hidden flex-1 justify-end tab:flex">
            <button type="button" aria-label="북마크">
              <BookmarkIcon className="size-7 text-[#5d5d5d]" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Card — Container, pc: px-10rem */}
      <Container className="pc:px-[10rem]">
        <ProfileCard profile={profile} />
      </Container>

      {/* Tabs — full width with Container padding */}
      <Container className="border-b border-[color:color(display-p3_0.7777_0.7777_0.7777)] tab:mt-[2.719rem]">
        <MyHomeTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </Container>

      {/* Post Create Bar — px-100px on desktop */}
      <div className="px-[1.25rem] tab:px-[6.25rem]">
        <PostCreateBar />
      </div>

      {/* Separator — full width */}
      <Separator className="bg-[color:color(display-p3_0.7777_0.7777_0.7777)]" />

      {/* Posts List — Container, pc: px-10rem */}
      <Container className="pc:px-[10rem]">
        {activeTab === 'posts' && (
          <div className="tab:mt-[2.959rem] tab:overflow-hidden tab:rounded-2xl tab:border tab:border-[color:color(display-p3_0.7777_0.7777_0.7777)]">
            {posts.map((post, index) => (
              <div key={post.id} className="tab:px-[3.125rem]">
                <PostCard post={post} />
                {index < posts.length - 1 && (
                  <Separator className="bg-[color:color(display-p3_0.7777_0.7777_0.7777)] tab:-mx-[3.125rem] tab:w-[calc(100%+6.25rem)]" />
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'breeders' && (
          <div className="py-20">
            <p className="text-center text-base font-medium text-[#959595]">
              즐겨찾는 브리더가 없습니다
            </p>
          </div>
        )}
      </Container>

      {/* Footer Placeholder */}
      <div className="mt-8 h-[22.1rem] w-full bg-[#d9d9d9]" />
    </div>
  )
}

export { MyHomeContent }
