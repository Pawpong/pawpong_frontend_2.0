const { load } = require('./core.fixture.cjs')

function studioMarkup(phase, canResume = true, props = {}) {
  const React = require('react')
  const { renderToStaticMarkup } = require('react-dom/server')
  const { AiFilterStudio } = load('src/features/ai-image/ui/AiFilterStudio.tsx', {
    react: React,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/image': { default: () => null },
    'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
    'next/navigation': { useRouter: () => ({ push() {} }) },
    '@tanstack/react-query': {
      useQuery: () => ({ data: [] }),
      useQueryClient: () => ({ invalidateQueries() {} }),
    },
    '@/entities/ai-image': { aiImageQueries: { myGenerations: () => ({ queryKey: [] }) } },
    '@/features/playground-pet/ui/PetResultLink': { PetResultLink: () => null },
    '@/shared/assets': { PawPrintIcon: () => null, PixelArrowRightIcon: () => null },
    '@/shared/ui/Skeleton': { SkeletonBlock: () => null },
    '@/shared/lib/fonts': { cafe24Proup: { className: 'fixture-font' } },
    '@/shared/config/playground': load('src/shared/config/playground.ts'),
    '@/shared/lib/cn': { cn: (...args) => args.filter(Boolean).join(' ') },
    '@/shared/lib/preparePhoto': {},
    '@/shared/ui': {
      Button: ({ children }) => React.createElement('button', null, children),
      ComposerSectionHeading: ({ children }) => React.createElement('h2', null, children),
      buttonVariants: () => '',
    },
    '@/shared/ui/PhotoUploadField': { PhotoUploadField: () => null },
    '../lib/aiImageFile': {},
    '../lib/useAiSourcePhoto': {
      useAiSourcePhoto: () => ({
        preparing: false,
        selectPhoto: async () => true,
        clearPhoto() {},
      }),
    },
    '../lib/pendingCommunityPhoto': {},
    './AiPostShareChoice': {},
    '../lib/useAiPixelFilter': {
      useAiPixelFilter: () => ({
        filters: [{ filterId: 'fixture', name: '포퐁 도트 초상화' }],
        selectedFilterId: 'fixture',
        phase,
        canResume,
        isWorking: phase === 'reconnecting',
        error: '아직 결과를 확인하지 못했어요. 보관함을 확인해 주세요.',
      }),
    },
    './AiPhotoArchive': { AiPhotoArchive: () => null },
    './BeforeAfterCompare': {},
  })
  return renderToStaticMarkup(React.createElement(AiFilterStudio, { isLoggedIn: true, ...props }))
}

module.exports = { studioMarkup }
