'use client'

import { useState } from 'react'
import { BookmarkIcon } from '@/shared/assets/icons'
import { Container, Separator } from '@/shared/ui'
import { MOCK_MY_HOME_PROFILE, MOCK_MY_HOME_POSTS } from '@/shared/mocks/myHome'
import { ProfileCard } from './ProfileCard'
import { HomeTabs, TabsContent } from './HomeTabs'
import { HomeTitle } from './HomeTitle'
import { PostList } from './PostList'
import { FooterPlaceholder } from './FooterPlaceholder'
import { PostCreateBar } from './PostCreateBar'
import { FavoriteBreedersContent } from './FavoriteBreedersContent'
import { MY_HOME_TABS } from './constants'

const MyHomeContent = () => {
  const [activeTab, setActiveTab] = useState('posts')
  const profile = MOCK_MY_HOME_PROFILE
  const posts = MOCK_MY_HOME_POSTS

  return (
    <div className="flex w-full flex-col">
      <HomeTitle
        title="마이홈"
        rightAction={
          <button type="button" aria-label="북마크" className="hidden tab:block">
            <BookmarkIcon className="size-7 text-text-primary" />
          </button>
        }
      />

      <Container className="pc:px-[10rem]">
        <ProfileCard profile={profile} />
      </Container>

      <HomeTabs tabs={MY_HOME_TABS} activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="px-[1.25rem] tab:px-[6.25rem]">
          <PostCreateBar />
        </div>

        <Separator className="bg-border-light" />

        <TabsContent value="posts" className="mt-0">
          <Container className="pc:px-[10rem]">
            <PostList posts={posts} />
          </Container>
        </TabsContent>

        <TabsContent value="breeders" className="mt-0">
          <FavoriteBreedersContent />
        </TabsContent>
      </HomeTabs>

      <FooterPlaceholder />
    </div>
  )
}

export { MyHomeContent }
