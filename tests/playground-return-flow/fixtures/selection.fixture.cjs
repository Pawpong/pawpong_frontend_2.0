const { load } = require('./navigation.fixture.cjs')
const { hooks, nodes } = require('../../fixtures/pet-shop.fixture.cjs')

function selectionFixture(initialSourceJobId = 'requested') {
  const runtime = hooks(),
    calls = { reads: 0, commands: [] }
  const query = {
    data: {
      pages: [{ images: [{ sourceJobId: 'first', imageUrl: '/first.png' }], nextCursor: 'next' }],
    },
    hasNextPage: true,
    isFetching: false,
    isError: false,
    fetchNextPage: async () => {
      calls.reads++
      query.isFetching = true
    },
    refetch: async () => {},
  }
  let options
  const noop = () => null
  const { PetAdoption } = load('src/features/playground-pet/ui/PetAdoption.tsx', {
    react: runtime.react,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/link': { default: noop },
    '@tanstack/react-query': {
      useInfiniteQuery: (value) => {
        options = value
        return query
      },
    },
    '@/entities/playground-pet': {
      ...load('src/entities/playground-pet/model/presentation.ts'),
      getEligiblePetImages: async () => ({ images: [] }),
    },
    '@/shared/ui/Button': { Button: noop, buttonVariants: () => '' },
    '@/shared/ui/Input': { Input: noop },
    '@/shared/assets': { PawPrintIcon: noop, PixelCheckIcon: noop },
    '../lib/usePetSession': { inPetSession: (_session, read) => read() },
    '../lib/usePetController': { petPrivateKey: () => ['private', 'synthetic-owner'] },
    '../lib/useServerClock': { petRequestKey: () => 'synthetic-key' },
    './PetImage': { PetImage: noop },
  })
  const props = {
    session: { scope: 'synthetic-owner' },
    initialSourceJobId,
    disabled: false,
    connectRevision: 7,
    onAdopt: (command) => calls.commands.push(command),
  }
  return {
    query,
    calls,
    props,
    options: () => options,
    render: () => nodes(runtime.render(() => PetAdoption(props))),
    unmount: runtime.unmount,
  }
}
module.exports = { selectionFixture }
