const { createElement } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { loadTypescript: load } = require('../../helpers/load-typescript.cjs')
const discovery = load('src/entities/community/model/discovery.ts')
const navigation = load('src/entities/community/model/feed-navigation.ts', {
  './discovery': discovery,
})
const nothing = () => null

function renderDiscoveryQuery(config, query = 'media=map') {
  let options, configOptions
  const { CommunityContent } = load('src/app/(main)/community/_ui/CommunityContent.tsx', {
    'next/navigation': {
      useRouter: () => ({ replace: nothing, push: nothing }),
      useSearchParams: () => new URLSearchParams(query),
    },
    '@tanstack/react-query': {
      useQuery: (value) => {
        configOptions = value
        return config
      },
      useInfiniteQuery: (value) => {
        options = value
        return { isPending: false, isError: false }
      },
    },
    '@/entities/community': {
      ...discovery,
      ...navigation,
      communityExperienceConfigOptions: {},
      communityQueries: { posts: () => ({ queryKey: ['community', 'posts'] }) },
      COMMUNITY_LOGIN_PROMPT: {},
      getFirstPhotoPostId: nothing,
    },
    '@/entities/gamification': { ActivityBadgeRow: nothing },
    '@/features/gamification': { ActivityEntry: nothing, usePublicActivityBadges: () => [] },
    '@/features/community': {
      useDeletePostConfirm: () => ({ modalProps: {} }),
      ConnectedFeedCard: nothing,
    },
    '@/features/auth': { useMe: () => ({}), useLoginGuard: () => ({ guard: (value) => value }) },
    '@/shared/ui': Object.fromEntries(
      [
        'Button',
        'DeleteConfirmModal',
        'Chip',
        'IconButton',
        'InfiniteScrollTrigger',
        'ListState',
        'LoginPromptModal',
        'NavigationBar',
        'SearchBar',
        'SortOptions',
      ].map((name) => [name, nothing]),
    ),
    '@/shared/assets': { PlusIcon: nothing },
    '@/shared/lib/infiniteList': { flattenPages: () => [] },
    '@/shared/lib/cn': { cn: () => '' },
    './constants': { COMMUNITY_SORT_OPTIONS: [] },
    './CommunityDiscovery': { CommunityDiscovery: nothing },
    './CommunityFeedMeta': { CommunityFeedMeta: nothing },
    './FeedFollowButton': { FeedFollowButton: nothing },
  })
  renderToStaticMarkup(createElement(CommunityContent))
  return { options, configOptions }
}

module.exports = { renderDiscoveryQuery }
