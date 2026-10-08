const { loadTypescript: load } = require('../../helpers/load-typescript.cjs')
const { hooks } = require('../../fixtures/pet-shop.fixture.cjs')
const navigation = load('src/entities/playground-pet/model/navigation.ts')

function navigationFixture(href = '/playground/pet') {
  let url = new URL(href, 'https://example.test')
  const replacements = []
  const runtime = hooks()
  const { usePetNavigation } = load(
    'src/features/playground-pet/lib/usePetNavigation.ts',
    {
      react: runtime.react,
      'next/navigation': { useSearchParams: () => url.searchParams },
      '@/entities/playground-pet': navigation,
    },
    {
      window: {
        get location() {
          return url
        },
        history: {
          replaceState: (_state, _title, next) => {
            replacements.push(next)
            url = new URL(next, url)
          },
        },
      },
    },
  )
  return {
    replacements,
    location: () => url,
    navigate: (href) => {
      url = new URL(href, url)
    },
    render: (active) => runtime.render(() => usePetNavigation(active)),
  }
}
module.exports = { load, navigation, navigationFixture }
