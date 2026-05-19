'use client'

import { useState } from 'react'
import { BookmarkIcon } from '@/shared/assets/icons'
import { Separator } from '@/shared/ui'
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
    <div className="flex w-full flex-col tab:px-[5rem] pc:px-[10rem]">
      {/* Title Section */}
      <div className="flex items-center justify-between pb-[3.219rem] pt-[2.969rem]">
        <div className="flex-1" />
        <h1 className="text-xl font-medium leading-[1.375rem] text-[#5d5d5d]">
          마이홈
        </h1>
        <div className="flex flex-1 justify-end">
          <button type="button" aria-label="북마크">
            <BookmarkIcon className="size-7 text-[#5d5d5d]" />
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <ProfileCard profile={profile} />

      {/* Tabs */}
      <div className="mt-[2.719rem] border-b border-[color:color(display-p3_0.7777_0.7777_0.7777)] tab:-mx-[5rem] tab:px-[5rem] pc:-mx-[10rem] pc:px-[10rem]">
        <MyHomeTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Post Create Bar — full width with px-100px */}
      <div className="tab:-mx-[5rem] tab:w-[calc(100%+10rem)] tab:px-[6.25rem] pc:-mx-[10rem] pc:w-[calc(100%+20rem)] pc:px-[6.25rem]">
        <PostCreateBar />
      </div>

      {/* Separator — full width */}
      <Separator className="bg-[color:color(display-p3_0.7777_0.7777_0.7777)] tab:-mx-[5rem] tab:w-[calc(100%+10rem)] pc:-mx-[10rem] pc:w-[calc(100%+20rem)]" />

      {/* Posts List */}
      {activeTab === 'posts' && (
        <div className="overflow-hidden rounded-2xl border border-[color:color(display-p3_0.7777_0.7777_0.7777)] mt-[2.959rem] ">
          {posts.map((post, index) => (
            <div key={post.id} className="px-[3.125rem]">
              <PostCard post={post} />
              {index < posts.length - 1 && (
                <Separator className="-mx-[3.125rem] w-[calc(100%+6.25rem)] bg-[color:color(display-p3_0.7777_0.7777_0.7777)]" />
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

      {/* Footer Placeholder */}
      <div className="mt-8 h-[22.1rem] w-full bg-[#d9d9d9]" />
    </div>
  )
}

export { MyHomeContent }
