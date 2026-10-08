const { loadTypescript: load } = require('../../helpers/load-typescript.cjs')
const model = load('src/features/playground-pet/lib/petStartIntent.ts')

function intentHookFixture(react) {
  return load('src/features/playground-pet/lib/usePetStartIntent.ts', {
    react: {
      ...react,
      useLayoutEffect: react.useLayoutEffect ?? react.useEffect,
      useSyncExternalStore:
        react.useSyncExternalStore ?? ((_subscribe, getSnapshot) => getSnapshot()),
    },
    './petStartIntent': model,
  })
}

module.exports = { ...model, intentHookFixture }
